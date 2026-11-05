/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select1177347317",
    "maxSelect": 5,
    "name": "position",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Poste 1",
      "Poste 2",
      "Poste 3",
      "Poste 4",
      "Poste 5"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select1177347317",
    "maxSelect": 0,
    "name": "position",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Poste 1",
      "Poste 2",
      "Poste 3",
      "Poste 4",
      "Poste 5"
    ]
  }))

  return app.save(collection)
})
