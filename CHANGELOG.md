# Changelog


- changed fontawesome to local usage
- added readme
- added ignore series option
  - ignored during capture & compare
- last updated icon can now be clicked to update manually
- added filter to display only series where we haven't watched all ger/eng episodes
- added label to display how many series are left after applying filters
- bookmark is now exactly on the border
- [fixed] isse where delete status was not updating the ui because we used concat and changed the array reference?
- [feature] added backup state so the user can go to the last state (in import view)
  - also works on delete state
- re-enabled auto save on import/add series, compare
- split the series list into marked and not marked ones
- new series are automatically added at front/top
- made the add series list more fuzzy (remove all before the actual url)
- remove all the auto saving state stuff
  - only on added series, check series, import
- we changed the series list
  - we use it now as import (additive)
- added button normalize the list manually
- we now remove duplicates from the input list automatically
- removed unused season, episode urls
  - episode urls change if we have a ger translation
- added mark series feature
  - marked series are displayed first (after all filters are applied)
- added last queried display
- we now mark seasons if on episode has changed (added/translated)
- cleaned up package.json
- added some filters (show only new, reverse order)
- added save status button
- added indicator if one watched all eng/ger episodes
- we now save on season select

## 1.0.0

- initial