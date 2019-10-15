# classic-eq-mapper
![img](https://raw.githubusercontent.com/ssk101/classic-eq-mapper/master/public/maps/image.png)

Displays your location on classic EQ maps in your browser via log parsing.

## Setup
```bash
$ npm i
```

Create a config file at root level called `config.json`:
```json
{
  "logDir": "<path to your EQ log directory>/",
  "logFile": "<full name of your target character's log file",
  "defaultContinent": "<e.g. antonica>",
  "defaultMap": "<e.g. grobb>",
  "debug": false /* true shows a green dot where 0, 0 should be */
}
```

## Serving
run `npm start` and open http://localhost:3000 in your browser.

## Notes
Most maps aren't populated with base coordinates, but you can check `/src/map/maps.json`, look at the existing images for reference and figure out the base X and Y coordinates for the maps you want to add from the map images.

`0, 0` starts at top left.

`modX` and `modY` means that the X or Y axes are "reversed" in the image, coordinate remapping functions depend on these.

The `x` and `y` arrays are normalized for west-to-east and north-to-south respectively, meaning if you have a map where `0, 0` is somewhere in the middle, the X axis starts at `200` at the top left and the Y axis ends at 800 at the top right, these should be reversed (check the Grobb map image for reference).
