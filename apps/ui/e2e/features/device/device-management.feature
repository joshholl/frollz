Feature: Device Management
  Users can create, update, and manage their film devices (cameras, interchangeable backs, and film holders)
  to track equipment available for capturing and processing film.

  Background:
    Given I am authenticated as "demo@example.com"

  Scenario: Create a 35mm direct-load camera
    When I create a camera with
      | field        | value              |
      | make         | Canon              |
      | model        | AE-1               |
      | filmFormatId | 1                  |
      | frameSize    | full_frame         |
      | loadMode     | direct             |
    Then the device is created successfully
    And the device is labeled "Canon AE-1"

  Scenario: Create a 120 camera with interchangeable back support
    When I create a camera with
      | field        | value                |
      | make         | Hasselblad           |
      | model        | 500CM/2              |
      | filmFormatId | 2                    |
      | frameSize    | 6x6                  |
      | loadMode     | interchangeable_back |
      | cameraSystem | V-system             |
    Then the device is created successfully
    And the camera supports interchangeable backs for "V-system"

  Scenario: Create a 4x5 large-format camera with film holder support
    When I create a camera with
      | field        | value      |
      | make         | Sinar      |
      | model        | F2         |
      | filmFormatId | 3          |
      | frameSize    | 4x5        |
      | loadMode     | film_holder|
    Then the device is created successfully
    And the device is labeled "Sinar F2"

  Scenario: Create an interchangeable back for Hasselblad
    When I create an interchangeable back with
      | field        | value          |
      | name         | CFV II 50C     |
      | system       | V-system       |
      | filmFormatId | 2              |
      | frameSize    | 6x6            |
    Then the device is created successfully
    And the device is labeled "CFV II 50C V-system"

  Scenario: Create a 4x5 sheet film holder
    When I create a film holder with
      | field           | value      |
      | name            | Grafmatic  |
      | brand           | Graflex    |
      | filmFormatId    | 3          |
      | frameSize       | 4x5        |
      | slotCount       | 2          |
      | holderTypeCode  | grafmatic  |
    Then the device is created successfully
    And the device is labeled "Grafmatic Graflex"
    And the device has 2 slots

  Scenario: Reject camera creation with invalid frame size for format
    When I attempt to create a camera with
      | field        | value      |
      | make         | Canon      |
      | model        | AE-1       |
      | filmFormatId | 1          |
      | frameSize    | 6x6        |
      | loadMode     | direct     |
    Then the creation fails with error "Frame size 6x6 is not valid for 35mm"

  Scenario: Reject creation with non-existent format
    When I attempt to create a camera with
      | field        | value      |
      | make         | Canon      |
      | model        | AE-1       |
      | filmFormatId | 999        |
      | frameSize    | full_frame |
      | loadMode     | direct     |
    Then the creation fails with error "Film format not found"

  Scenario: List all user devices
    Given these devices exist for the current user
      | type                 | make      | model     | name             | filmFormatId |
      | camera               | Canon     | AE-1      |                  | 1            |
      | camera               | Hasselblad| 500CM/2   |                  | 2            |
      | interchangeable_back |           |           | CFV II 50C       | 2            |
      | film_holder          |           |           | Grafmatic        | 3            |
    When I list my devices
    Then I see 4 devices
    And the list includes "Canon AE-1, Hasselblad 500CM/2, CFV II 50C, Grafmatic"

  Scenario: Reject device list access without authentication
    When I attempt to list devices without authentication
    Then the request fails with status 401

  Scenario: Get device details by id
    Given a camera exists with id 5
      | make  | model |
      | Nikon | FM2   |
    When I fetch device 5
    Then I get the device "Nikon FM2"

  Scenario: Reject fetch for non-existent device
    When I attempt to fetch device 999
    Then the request fails with error "Device not found"

  Scenario: Reject cross-user device access
    Given a camera exists for another user with id 99
    When I attempt to fetch device 99
    Then the request fails with status 404

  Scenario: Update camera frame size to half-frame
    Given a camera exists with id 5
      | make  | model | filmFormatId | frameSize  |
      | Canon | AE-1  | 1            | full_frame |
    When I update device 5 with
      | field     | value      |
      | frameSize | half_frame |
    Then the device frameSize is "half_frame"

  Scenario: Reject update with frame size invalid for current format
    Given a camera exists with id 5
      | make  | model | filmFormatId |
      | Canon | AE-1  | 1            |
    When I attempt to update device 5 with
      | field     | value |
      | frameSize | 6x6   |
    Then the update fails with error "Frame size 6x6 is not valid for 35mm"

  Scenario: Reject update of non-existent device
    When I attempt to update device 999 with
      | field | value     |
      | model | new model |
    Then the update fails with error "Device not found"

  Scenario: Delete device with no loaded film
    Given a camera exists with id 5
      | make | model |
      | Nikon| FM2   |
    When I delete device 5
    Then the device is removed
    And fetching device 5 fails with error "Device not found"

  Scenario: Reject deletion of device with loaded film
    Given a camera exists with id 5
      | make | model |
      | Nikon| FM2   |
    And a film is loaded in device 5
    When I attempt to delete device 5
    Then the deletion fails with error "Device still has an active loaded film"

  Scenario: Reject deletion of device with exposed film
    Given a camera exists with id 5
      | make | model |
      | Nikon| FM2   |
    And a film is exposed in device 5
    When I attempt to delete device 5
    Then the deletion fails with error "Device still has an active loaded film"

  Scenario: Delete device after removing film
    Given a camera exists with id 5
      | make | model |
      | Nikon| FM2   |
    And a film is loaded in device 5
    When the film is removed from device 5
    And I delete device 5
    Then the device is removed
