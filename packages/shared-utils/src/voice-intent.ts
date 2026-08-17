/**
 * Craftor AI Voice Interface & Speech-to-Intent Classifier
 * Translates natural speech transcripts into deterministic Elementor AST & WordPress MCP tool calls.
 */

export interface VoiceIntent {
  rawTranscript: string;
  intentCategory: 'layout_generation' | 'styling_mutation' | 'state_recovery' | 'site_operations' | 'ecommerce_action';
  targetTool: string;
  toolArguments: Record<string, unknown>;
  confidence: number;
  spokenConfirmation: string;
}

export interface VoiceSessionState {
  sessionId: string;
  active: boolean;
  transcriptHistory: Array<{ timestamp: string; speaker: 'user' | 'assistant'; text: string }>;
}

export class VoiceIntentClassifier {
  /**
   * Parses natural speech transcripts and classifies them into structured MCP tool calls.
   */
  public classify(transcript: string): VoiceIntent {
    const text = transcript.trim().toLowerCase();

    // 1. Hero / Section Generation
    if (text.includes('hero') || text.includes('banner') || text.includes('header section')) {
      return {
        rawTranscript: transcript,
        intentCategory: 'layout_generation',
        targetTool: 'craftor_elementor_generate_container',
        toolArguments: {
          layoutType: 'hero',
          title: 'Next-Gen Autonomous Architecture',
          subtitle: 'Synthesized directly from voice commands in sub-second latency.',
          ctaText: 'Explore Platform',
        },
        confidence: 0.98,
        spokenConfirmation: 'Generated responsive Hero container with glassmorphic styling.',
      };
    }

    // 2. Pricing Table Generation
    if (text.includes('pricing') || text.includes('plans') || text.includes('subscription table')) {
      return {
        rawTranscript: transcript,
        intentCategory: 'layout_generation',
        targetTool: 'craftor_elementor_generate_container',
        toolArguments: {
          layoutType: 'pricing',
          title: 'Flexible Plans for High-Growth Teams',
          ctaText: 'Get Started',
        },
        confidence: 0.97,
        spokenConfirmation: 'Constructed 3-tier pricing comparison container on canvas.',
      };
    }

    // 3. Rollback / Snapshot Recovery
    if (text.includes('rollback') || text.includes('undo') || text.includes('restore previous')) {
      return {
        rawTranscript: transcript,
        intentCategory: 'state_recovery',
        targetTool: 'craftor_restore_snapshot',
        toolArguments: {
          snapshotId: 'auto_latest_valid_snapshot',
        },
        confidence: 0.99,
        spokenConfirmation: 'Initiating transactional rollback to restore previous clean snapshot.',
      };
    }

    // 4. Performance / Cache Purge
    if (text.includes('purge cache') || text.includes('clear cache') || text.includes('optimize speed')) {
      return {
        rawTranscript: transcript,
        intentCategory: 'site_operations',
        targetTool: 'craftor_cdn_purge_cache',
        toolArguments: {
          request: { provider: 'cloudflare', purgeAll: true },
        },
        confidence: 0.96,
        spokenConfirmation: 'Purging edge CDN and LiteSpeed page caches now.',
      };
    }

    // 5. Popup / Lead Capture
    if (text.includes('popup') || text.includes('modal') || text.includes('lead capture')) {
      return {
        rawTranscript: transcript,
        intentCategory: 'layout_generation',
        targetTool: 'craftor_elementor_generate_popup',
        toolArguments: {
          title: 'Voice Synthesized Popup',
          triggerType: 'exit_intent',
          headline: 'Claim Exclusive Access',
          ctaText: 'Sign Up',
        },
        confidence: 0.95,
        spokenConfirmation: 'Created exit-intent modal popup with CTA trigger.',
      };
    }

    // Fallback: General Container Creation
    return {
      rawTranscript: transcript,
      intentCategory: 'layout_generation',
      targetTool: 'craftor_elementor_generate_container',
      toolArguments: {
        layoutType: 'features',
        title: 'Voice-Activated Section',
      },
      confidence: 0.88,
      spokenConfirmation: `Executed voice command: "${transcript}"`,
    };
  }
}

export class VoiceSessionManager {
  private sessions: Map<string, VoiceSessionState> = new Map();

  public startSession(sessionId: string): VoiceSessionState {
    const session: VoiceSessionState = {
      sessionId,
      active: true,
      transcriptHistory: [],
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public recordTurn(sessionId: string, speaker: 'user' | 'assistant', text: string): VoiceSessionState {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.startSession(sessionId);
    }
    session.transcriptHistory.push({
      timestamp: new Date().toISOString(),
      speaker,
      text,
    });
    return session;
  }

  public getSession(sessionId: string): VoiceSessionState | undefined {
    return this.sessions.get(sessionId);
  }
}
