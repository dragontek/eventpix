/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("events")

    // Description
    collection.fields.add(new Field({
        "system": false,
        "id": "events_description",
        "name": "description",
        "type": "text",
        "required": false,
        "presentable": false,
        "min": null,
        "max": null,
        "pattern": ""
    }))

    // Start Date
    collection.fields.add(new Field({
        "system": false,
        "id": "events_start_date",
        "name": "start_date",
        "type": "date",
        "required": false,
        "presentable": false,
        "min": "",
        "max": ""
    }))

    // End Date
    collection.fields.add(new Field({
        "system": false,
        "id": "events_end_date",
        "name": "end_date",
        "type": "date",
        "required": false,
        "presentable": false,
        "min": "",
        "max": ""
    }))

    return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("events")

    // remove fields
    collection.fields.removeById("events_description")
    collection.fields.removeById("events_start_date")
    collection.fields.removeById("events_end_date")

    return app.save(collection)
})
