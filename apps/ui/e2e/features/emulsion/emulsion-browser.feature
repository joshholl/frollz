Feature: Emulsion Browser
  Users can browse the shared catalog of film emulsions to discover available stocks,
  understand their characteristics, and see which formats and development processes they support.
  The catalog is read-only reference data shared across all users.

  Background:
    Given I am authenticated as "demo@example.com"

  Rule: The emulsion catalog lists all available film stocks

    Scenario: Browse all emulsions
      When I open the emulsion catalog
      Then I see the following emulsions listed:
        | Kodak Portra 400    |
        | Ilford HP5 Plus 400 |
        | Fujifilm Velvia 50  |
        | CineStill 800T      |

    Scenario Outline: Browse emulsions by development process
      When I view the <section> section
      Then I see <emulsions> listed

      Examples:
        | section         | emulsions                                                  |
        | colour negative | Kodak Gold 200, Kodak Portra 400, and Kodak Ektar 100      |
        | black-and-white | Ilford HP5 Plus 400, Ilford Delta 100, and Kodak Tri-X 400 |
        | colour positive | Fujifilm Velvia 50 and Fujifilm Provia 100                 |
        | cine            | CineStill 800T                                             |

  Rule: Emulsion detail shows characteristics and compatible formats

    Scenario Outline: View emulsion detail
      When I view the detail for <emulsion>
      Then I see it is a <balance> <process> film with ISO <iso>
      And it is available in <formats>

      Examples:
        | emulsion          | balance           | process | iso | formats             |
        | Kodak Portra 400  | daylight-balanced | C-41    | 400 | 35mm and 120        |
        | Fujifilm Velvia 50| daylight-balanced | E-6     | 50  | 35mm, 120, and 4x5  |
        | CineStill 800T    | tungsten-balanced | ECN-2   | 800 | 35mm and 120        |

  Rule: The catalog is read-only

    Scenario: No options to modify emulsions are presented
      When I view the emulsion catalog
      Then there are no options to add, edit, or remove emulsions

  Rule: Access requires authentication

    Scenario: Unauthenticated access is redirected to login
      Given I am not authenticated
      When I attempt to view the emulsion catalog
      Then I am redirected to the login page
