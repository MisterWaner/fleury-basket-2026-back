/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709074943")

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "number1846598919",
    "max": null,
    "min": 0,
    "name": "pointsFor",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "number2158202826",
    "max": null,
    "min": 0,
    "name": "pointsAgainst",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "number1760808434",
    "max": null,
    "min": null,
    "name": "pointsDiff",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3709074943")

  // remove field
  collection.fields.removeById("number1846598919")

  // remove field
  collection.fields.removeById("number2158202826")

  // remove field
  collection.fields.removeById("number1760808434")

  return app.save(collection)
})
