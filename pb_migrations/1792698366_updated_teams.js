/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "json1513624059",
    "maxSize": 0,
    "name": "slot",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "json1513624059",
    "maxSize": 0,
    "name": "schedule",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
