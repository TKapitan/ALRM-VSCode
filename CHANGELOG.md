# Change Log

## [Unreleased]

- Extend code for better usage for own backend part.
- Allow to change which Snippets will be used to create a new object.
- Add support for other possible types of authentification
- Add support for deleting fields and objects for Synchronize command
- Add support for other tenants in API call from "default"
- Improving Synchronize command to be quicker (do directory scanning and object scanning asynchronously)
- Autosynchronize once the project is initialized using "ALRM: Initialize"
- More validation directly in VS on field/object ranges

## [Released Versions]

### v0.3.6

- Date of release: 02/05/2021

Other changes

- The dotnet file (AL dotnet object type) does not cause synchronization error anymore.
- Add support for Control Addin object type.
- Improvements to parsing AL files for fields/values in table or enum extension
- Commented fields/values are not synchronized anymore (which could cause an error during synchronization when the field/value definition was not correct)
- AL file parsing is now case-insensitive (so object defined with first capital letter is not causing an error now).

### v0.3.1

- Date of release: 13/03/2021

Major changes

- New command "ALRM: Synchronize (beta)"
  - For details see <https://github.com/TKapitan/ALRM-VSCode/blob/master/README.md#alrm-synchronize-beta>
- Modified command: "ALRM: New Object"
  - Users are now able to select only object types that are available for the project runtime (based on runtime setting in app.json)
  - New Validation: the object name must be max 30 chars long
- New supported object types: PageCustomization, Profile
- New supported runtime: Business Central 2021 W1
  - New supported object types: ReportExtension, PermissionSet, PermissionSetExtension, Entitlement
- Changes to required API background
  - Microsoft.NAV.createObjectFieldOrValue for obtaining field IDs in "ALRM: New object extension field or value" command. Replace old command Microsoft.NAV.createObjectLine that is not called anymore).
  - Microsoft.NAV.createObjectFieldOrValueWithOwnID for registering existing fields (with already assigned field/value ID) using "ALRM: Synchronize (beta)" command.
  - Microsoft.NAV.createObjectWithOwnID for registering existing objects (with already assigned object ID) using "ALRM: Synchronize (beta)" command.

Other changes

- Restructuralization of objects & refactoring of objectType definitions and setting
- Fixed calls of APIs that has no return body
- Fixed of exception when no available IDs for fields/values error was returned from API
- Extended values loaded from app.json by runtime, platform and application
- Some minor refactoring and minor bug fixes

### v0.2.4

- Date of release: 03/01/2021
- Add support for Interface objects.

### v0.2.3

- Date of release: 08/12/2020
- Documentation for API to allow anyone build the backend part that works with this VS Code extension.
- Minor changes, refactoring

### v0.2.2

- Date of release: 01/12/2020
- Add preparation for other types of authentification (still only the Basic is supported)

### v0.2.1

- Date of release: 25/11/2020
- Change Range Code from mandatory to optional (using setting file)
- Minor changes, refactoring

### v0.2.0

- Date of release: 21/11/2020
- Initial release from Coding4BC hackathon
