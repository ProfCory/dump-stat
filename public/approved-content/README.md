# Approved Content

Place DM-approved **Dump Stat JSON export** files in this folder and push them to `main`.

The static deployment automatically rebuilds `manifest.json`. Players can then open **Import Content** and select **Load Approved Content** on any device. The packs are downloaded from this folder and imported into that device's browser storage.

Requirements:

- Use `.json` files exported by Dump Stat.
- Keep files directly in this folder; nested folders are not scanned.
- Use a new file name when you want to keep both versions of a pack.
- Reusing a file name updates that pack on the next deployment. Importing again updates same-named compendium entries rather than intentionally duplicating them.

`manifest.json` is generated during the static build and should not be edited by hand.
