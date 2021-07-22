# Change Log

## [Unreleased]

- Allow to change which Snippets will be used to create a new object.
- Add support for other possible types of authentification
- Add support for deleting fields and objects for Synchronize command
- Improving Synchronize command to be quicker (do directory scanning and object scanning asynchronously)
- Autosynchronize once the project is initialized using "ALRM: Initialize"
- More validation directly in VS on field/object ranges

## [Released Versions]

### v0.4.4

- Date of release: 23/07/2021

Fixes

- Reflect change of "Report Extension" snippet - the object name variable was renamed by Microsoft (See [Issue #26](https://github.com/TKapitan/ALRM-VSCode/issues/26)).
- Add an error message to extension initialization when no assignable range exists (See [Issue #24](https://github.com/TKapitan/ALRM-VSCode/issues/24)).
- Snippet variable replacement function is case-insensitive to avoid problems with changes in snippet format  (See [Issue #15](https://github.com/TKapitan/ALRM-VSCode/issues/15)).

Other changes

- New warning message when some of older API versions is used (checking during VS Code extension initialization).
- Remove setting 'Assignable Range = Do Not Use/API', the API is the only supported way now & in the future.

### v0.4.3

- Date of release: 10/06/2021

Fixes

- Wrong API URL if no tenant is specified (See [Issue #20](https://github.com/TKapitan/ALRM-VSCode/issues/20)).
- When Synchronize command fails, both success and failure messages are shown (See [Issue #18](https://github.com/TKapitan/ALRM-VSCode/issues/18)).

Other changes

- Added support for multi-company BC environments (new setting "Company Id" that is used to build proper API URL) (See [Issue #11](https://github.com/TKapitan/ALRM-VSCode/issues/11)).
- ALRM: Synchronize command is no longer beta version.
- Examples of both on-premises and cloud API URLs were added to the README.

### v0.4.2

- Date of release: 11/05/2021

Fixes

- New Enum does not contain assigned ID (See [Issue #6 from BC repo](https://github.com/TKapitan/ALRM-BusinessCentral/issues/6))

### v0.4.1

- Date of release: 10/05/2021

Major changes

- Added support for v1.1 APIs; the default version is still v1.0 (user can change API version in VS Code Setting).
- If the v1.1 API version is selected, the name of an extended object using the newly created extension object type is synchronised to BC. The name is synchronised only during synchronisation (not during the creation of a new AL object).
- When the new extension is initialised, the list of available assignable ranges contain more description loaded from BC API (See [Issue #12](https://github.com/TKapitan/ALRM-VSCode/issues/12))
- Default assignable range (info loaded from assignable ranges API) is now shown as a first item during extension initialisation (See [Issue #14](https://github.com/TKapitan/ALRM-VSCode/issues/14)).
- The processing of API calls was refactored. It is possible to select (by the user directly in VS Code setup) which API version should be used. The API versions are implemented using the default interface, and the newer version extends the older ones.

Other changes

- It is possible to connect to BC hosted on different tenant from default. User can specify tenant directly in VS Code Setup. (See [Issue #7](https://github.com/TKapitan/ALRM-VSCode/issues/7))
- Fix of error message when the API base URL not found (See [Issue #5](https://github.com/TKapitan/ALRM-VSCode/issues/5))

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

- New command "ALRM: Synchronize"
  - For details see <https://github.com/TKapitan/ALRM-VSCode/blob/master/README.md#alrm-synchronize>
- Modified command: "ALRM: New Object"
  - Users are now able to select only object types that are available for the project runtime (based on runtime setting in app.json)
  - New Validation: the object name must be max 30 chars long
- New supported object types: PageCustomization, Profile
- New supported runtime: Business Central 2021 W1
  - New supported object types: ReportExtension, PermissionSet, PermissionSetExtension, Entitlement
- Changes to required API background
  - Microsoft.NAV.createObjectFieldOrValue for obtaining field IDs in "ALRM: New object extension field or value" command. Replace old command Microsoft.NAV.createObjectLine that is not called anymore).
  - Microsoft.NAV.createObjectFieldOrValueWithOwnID for registering existing fields (with already assigned field/value ID) using "ALRM: Synchronize" command.
  - Microsoft.NAV.createObjectWithOwnID for registering existing objects (with already assigned object ID) using "ALRM: Synchronize" command.

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
