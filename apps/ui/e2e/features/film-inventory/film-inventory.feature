Feature: Film Inventory
  Users track individual rolls of analog film from purchase through archival.
  Each roll follows a defined lifecycle — from the freezer to the developer and beyond.

  Background:
    Given I am authenticated as "demo@example.com"

  Rule: Adding film to inventory records the emulsion, format, and purchase quantity

    Scenario: Add a batch of 35mm rolls
      When I add 3 rolls of "Kodak Portra 400" in "35mm" "36-exposure" format
      Then 3 individual rolls appear in my inventory in the "purchased" state
      And each roll belongs to the same purchase lot

    Scenario: Add a large-format sheet pack with an expiration date
      When I add 1 pack of "Fujifilm Velvia 50" in "4x5" "10-sheet" format expiring "2026-12-01"
      Then 1 roll appears in my inventory in the "purchased" state
      And the roll shows an expiration date of "2026-12-01"

    Scenario: Reject a lot when the package type is incompatible with the film format
      When I attempt to add "Kodak Portra 400" in "35mm" format with a "roll" package type
      Then the addition is rejected because "roll" is not a valid package type for "35mm"

  Rule: Each roll follows an independent lifecycle from purchase through archival

    Scenario: Store a purchased roll in the freezer
      Given a roll of "Ilford HP5 Plus 400" in "35mm" has been purchased
      When I store it in the "freezer"
      Then the roll's state is "stored"
      And its journey shows a "stored" event with storage location "freezer"

    Scenario Outline: Load a roll into a camera
      Given a roll of "Kodak Portra 400" in "35mm" <setup>
      When I load it into my "<camera>"
      Then the roll's state is "loaded"

      Examples:
        | setup                            | camera     |
        | has been purchased               | Canon AE-1 |
        | is stored in the "refrigerator"  | Nikon FM2  |

    Scenario: Move a frozen roll to the refrigerator before loading
      Given a roll of "Ilford HP5 Plus 400" in "35mm" is stored in the "freezer"
      When I move it to the "refrigerator"
      Then the roll's state remains "stored"
      And its journey shows a second "stored" event with storage location "refrigerator"

    Scenario: Mark a fully-shot roll as exposed
      Given a roll of "Kodak Portra 400" is loaded in my "Canon AE-1"
      When I mark it as fully exposed
      Then the roll's state is "exposed"

    Scenario: Remove an exposed roll from the camera
      Given a roll of "Kodak Portra 400" has been fully exposed in my "Canon AE-1"
      When I remove it from the camera
      Then the roll's state is "removed"

    Scenario: Send a removed roll to the lab
      Given a roll of "Kodak Portra 400" has been removed from the camera
      When I record that it was sent to "Richard Photo Lab"
      Then the roll's state is "sent for development"

    Scenario: Record development completion with push processing
      Given a roll of "Kodak Portra 400" has been sent to "Richard Photo Lab"
      When I record that it was developed at "+1" stop push
      Then the roll's state is "developed"
      And its journey shows development at "Richard Photo Lab" pushed "+1" stop

    Scenario: Record development with no push or pull
      Given a roll of "Ilford HP5 Plus 400" has been sent to the lab
      When I record that it was developed at box speed
      Then the roll's state is "developed"

    Scenario: Record scan completion
      Given a roll of "Kodak Portra 400" has been developed
      When I record that it was scanned with "Epson V700"
      Then the roll's state is "scanned"

    Scenario Outline: Archive a roll from its final development state
      Given a roll of "Kodak Portra 400" has been <prior_state>
      When I archive it
      Then the roll's state is "archived"

      Examples:
        | prior_state |
        | scanned     |
        | developed   |

  Rule: Invalid transitions are rejected

    Scenario Outline: Reject out-of-sequence state transitions
      Given a roll of "Kodak Portra 400" <current_state>
      When I attempt to record it as "<target_state>"
      Then the transition is rejected

      Examples:
        | current_state                         | target_state         |
        | is loaded in my "Canon AE-1"          | sent for development |
        | has been fully exposed in my "Canon AE-1" | stored           |

    Scenario: Reject double-loading a slot already occupied
      Given a roll of "Ilford HP5 Plus 400" is loaded in my "Hasselblad 500CM" slot "1"
      When I attempt to load a second roll of "Kodak Portra 400" into the same slot
      Then the loading is rejected because slot "1" is already occupied

  Rule: Inventory can be filtered by state, format, and emulsion

    Scenario Outline: Filter inventory
      Given my inventory contains rolls with different <filter_type>s
      When I filter by "<filter_value>"
      Then only "<filter_value>" rolls appear

      Examples:
        | filter_type | filter_value     |
        | state       | loaded           |
        | emulsion    | Kodak Portra 400 |
        | format      | 120              |

  Rule: Rolls can only be deleted when purchased or archived

    Scenario Outline: Delete a roll in a deleteable state
      Given a roll of "Kodak Portra 400" has been <state>
      When I delete it
      Then it no longer appears in my inventory

      Examples:
        | state     |
        | purchased |
        | archived  |

    Scenario: Reject deletion of a roll that is loaded in a device
      Given a roll of "Kodak Portra 400" is loaded in my "Canon AE-1"
      When I attempt to delete it
      Then the deletion is rejected because the roll is active in a device
