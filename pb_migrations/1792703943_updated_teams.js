/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text269960980",
    "max": 0,
    "min": 0,
    "name": "division",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3886292400")

  // remove field
  collection.fields.removeById("text269960980")

  return app.save(collection)
})
