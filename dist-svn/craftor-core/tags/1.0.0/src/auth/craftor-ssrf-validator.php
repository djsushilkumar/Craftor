<?php
namespace Craftor\Core\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Craftor Enterprise SSRF Defense-in-Depth Validator
 * Protects media sideloading and external HTTP fetches against:
 * 1. Alternate IPv4 representations (decimal, octal, hex, leading zeroes)
 * 2. Alternate IPv6 representations (bracketed, uncompressed, IPv4-mapped)
 * 3. Private RFC1918, Loopback, Link-Local, and Cloud Metadata (169.254.169.254)
 * 4. DNS Rebinding (resolves and validates all A/AAAA records before connection)
 * 5. Non-HTTP protocols (file, ftp, gopher, dict, data, phar, etc.)
 */
class CraftorSsrfValidator {

    /**
     * Validates a URL against all SSRF attack vectors.
     *
     * @param string $url The target URL.
     * @return array ['safe' => bool, 'error' => string|null, 'resolved_ips' => array]
     */
    public static function validate_url( string $url ): array {
        if ( empty( $url ) || ! is_string( $url ) ) {
            return [ 'safe' => false, 'error' => 'URL cannot be empty', 'resolved_ips' => [] ];
        }

        // 1. Validate URL Scheme (HTTP / HTTPS only)
        $parsed = wp_parse_url( $url );
        if ( ! $parsed || ! isset( $parsed['scheme'] ) || ! isset( $parsed['host'] ) ) {
            return [ 'safe' => false, 'error' => 'Malformed URL structure', 'resolved_ips' => [] ];
        }

        $scheme = strtolower( $parsed['scheme'] );
        if ( ! in_array( $scheme, [ 'http', 'https' ], true ) ) {
            return [ 'safe' => false, 'error' => sprintf( 'Scheme "%s" is not allowed. Only HTTP and HTTPS are permitted.', $scheme ), 'resolved_ips' => [] ];
        }

        $raw_host = $parsed['host'];
        // Strip IPv6 brackets if present
        $host = trim( $raw_host, '[]' );

        // 2. Check Static Blacklisted Hostnames (Cloud Metadata & Localhost)
        $static_blocked_hosts = [
            'localhost',
            'localhost.localdomain',
            'metadata.google.internal',
            'instance-data',
            '169.254.169.254',
            'metadata.azure.com',
        ];
        if ( in_array( strtolower( $host ), $static_blocked_hosts, true ) ) {
            return [ 'safe' => false, 'error' => sprintf( 'Host "%s" is a prohibited internal/metadata endpoint (SSRF Guard)', $host ), 'resolved_ips' => [] ];
        }

        // 3. Normalize & Detect Alternate IP representations
        $normalized_ip = self::normalize_ip_literal( $host );
        if ( $normalized_ip !== null ) {
            if ( self::is_prohibited_ip( $normalized_ip ) ) {
                return [ 'safe' => false, 'error' => sprintf( 'IP address "%s" is in a prohibited/private/loopback range', $normalized_ip ), 'resolved_ips' => [ $normalized_ip ] ];
            }
            return [ 'safe' => true, 'error' => null, 'resolved_ips' => [ $normalized_ip ] ];
        }

        // 4. Hostname DNS Resolution (DNS Rebinding Defense)
        $resolved_ips = self::resolve_all_ips( $host );
        if ( empty( $resolved_ips ) ) {
            // If hostname does not resolve, block fetch
            return [ 'safe' => false, 'error' => sprintf( 'Hostname "%s" could not be resolved via DNS', $host ), 'resolved_ips' => [] ];
        }

        // 5. Validate EVERY resolved IP address
        foreach ( $resolved_ips as $ip ) {
            if ( self::is_prohibited_ip( $ip ) ) {
                return [
                    'safe'         => false,
                    'error'        => sprintf( 'Host "%s" resolves to prohibited internal address "%s" (DNS Rebinding Guard)', $host, $ip ),
                    'resolved_ips' => $resolved_ips,
                ];
            }
        }

        return [ 'safe' => true, 'error' => null, 'resolved_ips' => $resolved_ips ];
    }

    /**
     * Resolves all A and AAAA DNS records for a given hostname.
     */
    public static function resolve_all_ips( string $host ): array {
        $ips = [];

        // In test or CLI environment where dns_get_record may be mocked or unavailable:
        if ( function_exists( 'dns_get_record' ) ) {
            $records_a = @dns_get_record( $host, DNS_A );
            if ( is_array( $records_a ) ) {
                foreach ( $records_a as $r ) {
                    if ( isset( $r['ip'] ) ) {
                        $ips[] = $r['ip'];
                    }
                }
            }

            $records_aaaa = @dns_get_record( $host, DNS_AAAA );
            if ( is_array( $records_aaaa ) ) {
                foreach ( $records_aaaa as $r ) {
                    if ( isset( $r['ipv6'] ) ) {
                        $ips[] = $r['ipv6'];
                    }
                }
            }
        }

        if ( empty( $ips ) && function_exists( 'gethostbynamel' ) ) {
            $by_name = @gethostbynamel( $host );
            if ( is_array( $by_name ) ) {
                $ips = array_merge( $ips, $by_name );
            }
        }

        if ( empty( $ips ) && function_exists( 'gethostbyname' ) ) {
            $single = @gethostbyname( $host );
            if ( $single && $single !== $host ) {
                $ips[] = $single;
            }
        }

        return array_values( array_unique( $ips ) );
    }

    /**
     * Normalizes alternate integer, hex, octal, and mapped IP representations into canonical dotted IPv4 or IPv6.
     */
    public static function normalize_ip_literal( string $host ): ?string {
        // Standard IPv4 / IPv6
        if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
            // Expand IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
            if ( stripos( $host, '::ffff:' ) === 0 || stripos( $host, '0:0:0:0:0:ffff:' ) === 0 ) {
                $parts = explode( ':', $host );
                $last = end( $parts );
                if ( filter_var( $last, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
                    return $last;
                }
            }
            return $host;
        }

        // Pure decimal integer IPv4 (e.g. 2130706433 -> 127.0.0.1)
        if ( ctype_digit( $host ) ) {
            $num = (float) $host;
            if ( $num >= 0 && $num <= 4294967295 ) {
                return long2ip( (int) $num );
            }
        }

        // Hexadecimal IPv4 (e.g. 0x7f000001 or 0x7f.0x0.0x0.0x1)
        if ( stripos( $host, '0x' ) !== false ) {
            if ( preg_match( '/^0x[0-9a-fA-F]+$/i', $host ) ) {
                $dec = hexdec( $host );
                if ( $dec >= 0 && $dec <= 4294967295 ) {
                    return long2ip( (int) $dec );
                }
            }
        }

        // Octal / Dotted quad with leading zeros (e.g. 0177.0.0.1 or 127.000.000.001)
        if ( preg_match( '/^([0-9a-fx]+)\.([0-9a-fx]+)\.([0-9a-fx]+)\.([0-9a-fx]+)$/i', $host, $m ) ) {
            $octets = [];
            for ( $i = 1; $i <= 4; $i++ ) {
                $val = $m[ $i ];
                if ( stripos( $val, '0x' ) === 0 ) {
                    $octets[] = hexdec( $val );
                } elseif ( strpos( $val, '0' ) === 0 && strlen( $val ) > 1 ) {
                    $octets[] = octdec( $val );
                } else {
                    $octets[] = (int) $val;
                }
            }
            if ( count( $octets ) === 4 ) {
                return implode( '.', $octets );
            }
        }

        // Uncompressed IPv6 loopback (e.g. 0:0:0:0:0:0:0:1)
        if ( strpos( $host, ':' ) !== false ) {
            $packed = @inet_pton( $host );
            if ( $packed !== false ) {
                return inet_ntop( $packed );
            }
        }

        return null;
    }

    /**
     * Evaluates whether an IP address belongs to a prohibited/internal/cloud metadata subnet.
     */
    public static function is_prohibited_ip( string $ip ): bool {
        // Standard PHP flag check
        if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
            if ( ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
                return true;
            }

            $long = ip2long( $ip );
            if ( $long === false ) {
                return true;
            }

            // Prohibited IPv4 CIDRs
            $prohibited_cidrs = [
                '0.0.0.0/8',          // Current network
                '10.0.0.0/8',         // RFC1918 Private
                '100.64.0.0/10',      // Carrier-Grade NAT
                '127.0.0.0/8',        // Loopback
                '169.254.0.0/16',     // Link-Local & Cloud Metadata (169.254.169.254)
                '172.16.0.0/12',      // RFC1918 Private
                '192.0.0.0/24',       // IETF Protocol
                '192.0.2.0/24',       // TEST-NET-1
                '192.88.99.0/24',     // 6to4 Relay
                '192.168.0.0/16',     // RFC1918 Private
                '198.18.0.0/15',      // Benchmarking
                '198.51.100.0/24',    // TEST-NET-2
                '203.0.113.0/24',     // TEST-NET-3
                '224.0.0.0/4',        // Multicast
                '240.0.0.0/4',        // Reserved
                '255.255.255.255/32', // Broadcast
            ];

            foreach ( $prohibited_cidrs as $cidr ) {
                if ( self::ipv4_in_cidr( $ip, $cidr ) ) {
                    return true;
                }
            }

            return false;
        }

        if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 ) ) {
            if ( ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
                return true;
            }

            // IPv6 Loopback & Unique Local & Link-Local
            $packed = @inet_pton( $ip );
            if ( $packed === false ) {
                return true;
            }

            // Check ::1, ::, fc00::/7, fe80::/10, ff00::/8
            if ( $ip === '::1' || $ip === '::' ) {
                return true;
            }

            $first_byte = ord( $packed[0] );
            if ( ( $first_byte & 0xfe ) === 0xfc ) { // fc00::/7 (Unique Local)
                return true;
            }
            if ( $first_byte === 0xfe && ( ord( $packed[1] ) & 0xc0 ) === 0x80 ) { // fe80::/10 (Link-Local)
                return true;
            }
            if ( $first_byte === 0xff ) { // ff00::/8 (Multicast)
                return true;
            }

            return false;
        }

        return true;
    }

    private static function ipv4_in_cidr( string $ip, string $cidr ): bool {
        list( $subnet, $mask ) = explode( '/', $cidr );
        $ip_long = ip2long( $ip );
        $subnet_long = ip2long( $subnet );
        $mask_long = -1 << ( 32 - (int) $mask );
        return ( $ip_long & $mask_long ) === ( $subnet_long & $mask_long );
    }
}
