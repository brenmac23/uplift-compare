/**
 * Plain English tooltip text for every criterion in both scoring systems.
 *
 * Keys use the criterion ID prefixed with the system to avoid conflicts where
 * both systems reuse IDs (e.g. both have an "A1", but they mean different things).
 *
 * Usage: CRITERION_TOOLTIPS[`existing:${criterion.id}`] or CRITERION_TOOLTIPS[`proposed:${criterion.id}`]
 * Fallback: CRITERION_TOOLTIPS[criterion.id] for shared/unambiguous IDs.
 */
export const CRITERION_TOOLTIPS: Record<string, string> = {
  // ── Existing System ────────────────────────────────────────────────────────

  // Section A: Sustainability
  'existing:A1':
    'Production must have a Sustainability Action Plan before filming and submit a final Sustainability Report. This is mandatory — failing it causes the existing test to fail regardless of total score.',
  'existing:A2':
    'A dedicated Sustainability Officer must be appointed to oversee and coordinate all sustainability efforts on the production.',
  'existing:A3':
    'Production must commission an independent Carbon Emissions Review to measure and report the production\'s carbon footprint.',

  // Section B: NZ Production Activity
  'existing:B1':
    'The production (or a related entity) must have leased an NZ studio facility for at least 3 years at the time of application.',
  'existing:B2':
    'A previous qualifying production by the same applicant must have achieved Qualifying NZ Production Expenditure (QNZPE) of $100 million or more.',
  'existing:B3':
    'Production is a sequel, prequel, or spin-off of a previous production, released within 3 years of the prior production\'s delivery.',
  'existing:B4':
    'Points awarded based on the percentage of principal photography shot in New Zealand. 75%+ earns 1 point; 90%+ earns 2 points.',
  'existing:B5':
    'At least 25% of NZ shooting days must take place outside Auckland and Wellington (classified as "regions"). Earns 2 points if met.',
  'existing:B6':
    'Points awarded based on the percentage of picture post-production work (editing, colour grading, etc.) completed in NZ. 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',
  'existing:B7':
    'Points awarded based on the percentage of sound post-production work (mixing, ADR, Foley, etc.) completed in NZ. 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',
  'existing:B8':
    'Points awarded based on the percentage of digital/visual effects work completed in NZ. Thresholds are higher than proposed: 50%+ earns 1pt; 75%+ earns 2pts; 90%+ earns 3pts.',
  'existing:B9':
    'Points awarded based on the percentage of concept design and physical effects work completed in NZ. 50%+ earns 1pt; 75%+ earns 2pts; 90%+ earns 3pts.',

  // Section C: NZ Personnel
  'existing:C1':
    'At least 80% of all cast must be Qualifying Persons (NZ citizens/residents or those who have the right to work in NZ). Earns 2 points if met.',
  'existing:C2':
    'At least 80% of the total crew must be Qualifying Persons. Earns 1 point if met.',
  'existing:C3':
    'At least 10% of the Qualifying Person crew must be Māori. This criterion exists only in the existing test.',
  'existing:C4':
    'Each Above-the-Line Qualifying Person (director, producer, writer, lead cast) earns 3 points, up to 3 people (maximum 9 points total).',
  'existing:C5':
    'Key Below-the-Line roles filled by Qualifying Persons earn 1 point each, up to 4 points. Key roles include DOP, 1st AD, Editor, VFX Supervisor, Costume Designer, Composer, and Production Designer.',
  'existing:C6':
    'Additional Below-the-Line Qualifying Person crew (beyond the key roles in C5) earn 0.5 points each, up to 4 points total.',
  'existing:C7':
    'Having at least one Qualifying Person in a lead cast role earns 3 points.',
  'existing:C8':
    'Each Qualifying Person in a supporting cast role earns 1 point, up to 3 people (maximum 3 points total).',
  'existing:C9':
    'Having a NZ Casting Director earns 2 points; a NZ Casting Associate earns 1 point. Only the highest applicable level is awarded.',
  'existing:C10':
    'If the lead cast or an Above-the-Line crew member is Māori, the production earns 2 points. This criterion exists only in the existing test.',

  // Section D: Skills & Talent Development
  'existing:D1':
    'Production runs one or more Masterclass sessions open to NZ screen sector practitioners, sharing skills and industry knowledge. Earns 2 points.',
  'existing:D2':
    'Production delivers educational seminars to the NZ education sector (e.g. schools, universities, film schools). Earns 1 point.',
  'existing:D3':
    'Paid attachment positions for Qualifying Persons must be provided. The minimum number required depends on QNZPE: 2 attachments if QNZPE is under $100m; 4 attachments if QNZPE is $100m or more. Earns 2 points.',
  'existing:D4':
    'Paid internships for Qualifying Persons must be provided. Minimum required: 4 internships (QNZPE under $50m), 8 internships ($50m–$150m), or 10 internships (over $150m). Earns 1 point.',

  // Section E: Innovation & Infrastructure (existing only)
  'existing:E1':
    'Production transfers knowledge of a new production method or technology to NZ practitioners (e.g. training sessions, documentation, workshops). Earns 2 points. This criterion exists only in the existing test.',
  'existing:E2':
    'Production enters a commercial agreement for a new production method or technology representing at least 0.25% of QNZPE (1pt), 0.5% (2pts), or 1% (3pts).',
  'existing:E3':
    'Production invests in NZ infrastructure (e.g. studio equipment, facilities). $500k+ earns 1pt; $1m+ earns 2pts; $2m+ earns 3pts.',

  // Section F: Marketing
  'existing:F1':
    'Holding the world premiere in NZ earns 3 points. Holding an NZ domestic premiere (not world premiere) earns 2 points. Only the higher tier applies.',
  'existing:F2':
    'A bespoke film marketing partnership with the NZ Film Commission (NZFC) to promote NZ as a production destination. Earns 3 points.',
  'existing:F3':
    'A bespoke tourism marketing partnership with Tourism New Zealand (TNZ) to showcase NZ locations and culture. Earns 3 points.',
  'existing:F4':
    'A bespoke partnership with Tourism New Zealand combining film promotion and tourism activity. Earns 3 points.',

  // ── Proposed System ────────────────────────────────────────────────────────

  // Section A: NZ Production Activity
  'proposed:A1':
    'A previous qualifying production by the same applicant must have achieved QNZPE of $100 million or more. Earns 2 points.',
  'proposed:A2':
    'Production is a sequel, prequel, or spin-off of a previous production, released within 5 years (extended from 3 years in the existing test). Earns 2 points.',
  'proposed:A3':
    'Points awarded based on the percentage of principal photography shot in New Zealand. 75%+ earns 1 point; 90%+ earns 2 points.',
  'proposed:A4':
    'Points awarded based on the percentage of NZ shooting days in regional locations (outside Auckland and Wellington). 10%+ earns 1 point; 25%+ earns 2 points. The proposed test adds the 10% lower tier.',
  'proposed:A5':
    'Points awarded based on the percentage of picture post-production completed in NZ. 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',
  'proposed:A6':
    'Points awarded based on the percentage of sound post-production completed in NZ. 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',
  'proposed:A7':
    'Points awarded based on the percentage of digital/visual effects work completed in NZ. Thresholds are lower than existing: 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',
  'proposed:A8':
    'Points awarded based on the percentage of concept design and physical effects work completed in NZ. Thresholds are lower than existing: 30%+ earns 1pt; 50%+ earns 2pts; 75%+ earns 3pts.',

  // Section B: NZ Personnel
  'proposed:B1':
    'Points awarded based on the percentage of cast who are Qualifying Persons. 60%+ earns 2 points; 80%+ earns 3 points. The proposed test adds the 60% tier and increases the top award from 2 to 3 points.',
  'proposed:B2':
    'At least 80% of the crew must be Qualifying Persons. Earns 3 points (compared to 1 point in the existing test).',
  'proposed:B3':
    'Each Above-the-Line Qualifying Person (director, producer, writer, lead cast) earns 3 points, up to 3 people (maximum 9 points total).',
  'proposed:B4':
    'Key Below-the-Line roles filled by Qualifying Persons earn 1 point each, up to 4 points. Key roles include DOP, 1st AD, Editor, VFX Supervisor, Costume Designer, Composer, and Production Designer.',
  'proposed:B5':
    'Additional Below-the-Line Qualifying Person crew (beyond the key roles in B4) earn 0.5 points each, up to 4 points total.',
  'proposed:B6':
    'Having at least one Qualifying Person in a lead cast role earns 4 points (compared to 3 points in the existing test).',
  'proposed:B7':
    'Each Qualifying Person in a supporting cast role earns 1 point, up to 3 people (maximum 3 points total).',
  'proposed:B8':
    'Having a NZ Casting Director earns 2 points; a NZ Casting Associate earns 1 point. Only the highest applicable level is awarded.',

  // Section C: Skills & Talent Development
  'proposed:C1':
    'Production delivers seminars or workshops to NZ screen industry practitioners. Earns 1 point. This replaces the existing Masterclass criterion with a broader category.',
  'proposed:C2':
    'Production delivers educational seminars to the NZ education sector (e.g. schools, universities, film schools). Earns 1 point.',
  'proposed:C3':
    'Paid attachment positions for Qualifying Persons must be provided. Minimum required: 2 attachments (QNZPE under $100m) or 4 attachments ($100m+). Earns 2 points.',
  'proposed:C4':
    'Paid internships for Qualifying Persons must be provided. Minimum required: 2 internships (QNZPE under $100m) or 4 internships ($100m+). Earns 2 points. Thresholds are significantly lower than the existing test.',

  // Section D: Marketing
  'proposed:D1':
    'Two independent yes/no criteria: holding an NZ premiere earns 2 points, and committing to international promotional activities earns 2 points. Both can be earned simultaneously (maximum 4 points).',
  'proposed:D2':
    'A bespoke marketing partnership with the NZ Film Commission (NZFC) to promote NZ as a production destination. Earns 3 points.',
  'proposed:D3':
    'Production makes a public announcement of its NZ location, contributing to international awareness of NZ as a filming destination. Earns 1 point. This criterion exists only in the proposed test.',
  'proposed:D4':
    'A bespoke partnership with Tourism New Zealand to promote NZ as a travel destination through the production. Earns 4 points (compared to 3 points in the existing test).',
};
