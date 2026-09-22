/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_2fxx89dyw9` ON `teams` (`slug`)"
    ],
    "name": "teams"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_2fxx89dyw9` ON `equipes` (`slug`)"
    ],
    "name": "equipes"
  }, collection)

  return app.save(collection)
})
