# Example: Product Requirement Document (PRD) Extraction

## Context
A request is made to add support for bulk image alt-text generation using vision AI.

## PM Workflow Execution
1. **Persona Selection:** Sophia Al-Mansoor (E-commerce Director) & Elena Rostova (Visual Builder).
2. **Feature Name:** Bulk Media Alt-Text AI Optimizer.
3. **MoSCoW Tier:** Should Have (RICE Score: 115).
4. **Tool Mapping:** Maps to `wp_batch_update_image_alts` (#186) and `wp_query_media_library` (#188).

## Gherkin Scenario
```gherkin
Feature: Bulk Alt-Text Optimization
  Scenario: Generate alt-text for uncaptioned product catalog images
    Given 25 product images in the media library with empty post_excerpt and _wp_attachment_image_alt
    When the client invokes `wp_batch_update_image_alts(target_filter: 'unattached_or_missing')`
    Then all 25 images receive descriptive, SEO-optimized alt text (<125 characters)
    And an audit entry is logged in Craftor Activity Log.
```
