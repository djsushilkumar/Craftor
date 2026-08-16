# Example: SSRF URL Sanitization Method

```php
namespace Craftor\Security;

class UrlValidator {
    /**
     * Verifies that a media sideload URL is a safe public endpoint (prevents SSRF).
     *
     * @param string $url
     * @return bool
     */
    public static function is_safe_public_url( string $url ): bool {
        $parsed = wp_parse_url( $url );
        if ( ! isset( $parsed['host'] ) || ! in_array( $parsed['scheme'], [ 'http', 'https' ], true ) ) {
            return false;
        }

        $ip = gethostbyname( $parsed['host'] );
        if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) === false ) {
            // Blocked: Private or reserved IP range (e.g., 127.0.0.1, 10.0.0.0/8, 169.254.169.254)
            return false;
        }

        return true;
    }
}
```
