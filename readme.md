# Bs Observer

Ein Tool (Webseite) um Serien auf Bs zu beobachten


## Demo

[Demo](https://janisdd.github.io/bs-observer/)

## Workflow

Etwas unübersichtlich/unstrukturiert, erklärt aber fast alle Funktionen

- Man fügt die Urls der Serien hinzu (wird automatisch gekürzt z.b. von einer Folge auf die Basis-Url)
  - Dabei werden initial die Informationen der Serie abgerufen
- Danach kann man auf *Prüfen & Vergleichen* klicken und es werden die Informationen der Serien erneut abgerufen
  - Dabei werden die Informationen verglichen und Änderungen markiert (z.b. Neue Staffel/Neue Folge mit einem Punkt)
  - Die Markierung bleibt bestehen, auch wenn man noch mal auf *Prüfen & Vergleichen* klickt, damit man nichts übersieht
    - Sind wieder Änderung hinzugekommen, werden diese zusätzlich markiert
    - Um die Markierungen zu entfernen, kann man *Reset News* klicken
  - Markierte (geänderte) Serien lassen sich mittels eines Filters anzeigen

- Falls es Fehler beim Abrufen einer Serie gibt, stoppt *Prüfen & Vergleichen*
  - Die betroffene Url wird angezeigt und man kann die Serie mittels des Ausrufezeichens ignorieren (z.b. wenn die Serie nicht mehr verfügbar ist)
  - Ignorierte serien werden beim *Prüfen & Vergleichen* zwar mit angezeicht, jedoch übersprungen
- Die Serien und ihr Zustand wird in einem globalen Zustand gespeichert
  - Bei einigen Aktionen wird der Zustand automatisch gepsichert (Import, Serien hinzufügen, Prüfen & Vergleichen)
  - Der Zustand kann aber auch gespeichern werden
  - Wird der Zustand gespeichert, wir vorher der aktuelle Zustand zusätzlich gespeichert (als Backup)
    - Der vorherige Zustand kann bei *Import* wiederhergestellt werden
  - Mittels *Export* kann man den globalen Zustand *exportieren*
    - Tatsächlich muss man den Text dann manuell iregdnwo speichern (z.b. Textdatei/JSON-Datei)
    - Hier wird auch eine Liste der Serien angezeigt
  - Bei jeder Serie kann außerdem angekreuzt werden, welche folge man schon gesehen hat, was ebenfalls im Zustand (an jeder Serie) gespeichert wird
  - Man kann dne globalen Zustand auch löschen, davor wird der Backup-Zustand auf den aktuellen Zustand gesetzt!

- Hat man von einer Serie alle Folgen gesehen, wird das ebenfalls angezeigt (Specials werden dabei ignoriert)
  - Hierfür gibt es ebenfalls einen Filter (zeige alle noch nicht gesehen...)
  - Dies gibt es für die englischen und deutschen Varianten separat (Alle Deu gesehen / Alle Eng gesehen)
    - Diese *Badges* zeigen an, dass man alle verfügbaren (übersetzen bei ger) Episoden gesehen hat

- Man kann Serien auch mittels des Bookmark-Symbols markieren, diese werden dann vor allen anderen Serien angezeigt
  - Praktisch, wenn man mehrere Serien gleichzeitig guckt

**Hinweise**

- Der globale Zustand wird im `localStorage` des Browsers gespeichert, `localStorage` ist in der *same origin* verfügbar, wie ist das bei lokalen Dateien (z.B. nach Verschieben)??
  - Da es sich um eine lokale Datei handelt (index.html) ist es schwer zu sagen, wann es sich um die "gleiche Datei" für den Browser handelt
    - Aus diesem Grund kann es unterschiedliche Gründe haben, dass der globale Zustand **nicht mehr gefunden wird**
    --> Daher wäre es ratsam, dass man **vor** dem Schließen der Seite den Zustand exportiert (den Text in eine Datei speichert)
  - Solange die Datei (index.html) nicht umbenannt oder verschoben wird, **sollte** das aber kein Problem sein
  - `localStorage` hat außerdem ein Größenlimit, was von Browser zu Browser verschieden ist, ca. 5 MB kann als Orientierung dienen
    - Der Backup-Zustand nimmt ca. den gleichen Platz ein, d.h. wenn bei Export um die ~2.5 MB steht, kann es in nächster Zeit passieren, dass der Zustand nicht mehr gespeichert werden kann
      - Was dann? - Keine Ahnung ;) [man könnte den Zustand dann intern komprimieren, aber soweit sollte es nicht kommen]

- Die Reihenfolge der Serien ist nicht festgelegt und könnte sich ändern (sollte aber eigentlich nicht)
  - Vielleicht soll man sie alphabetisch sortieren?? [TODO]


## Safari

Bei Safari muss `Entwickler > Lokale Dateieinschränkungen deaktivieren` aktiviert werden, damit `localStorage` genutzt werden kann

## Test-Server starten

Startet den Webpack dev Server

```
npm run dev
```

Dann im Browser `http://localhost:8080` aufrufen

## Erstellen

Erstellt die Webseite in den `dist` Ordner

```
npm run build
```

Dann im Browser die Datei `index.html` öffnen

## Tests

Erstellt mit jest, nur das Vergleichen wird getestet

Test-Dateien sind in `__tests__` zu finden

```
npm run test
```

## Used Projects

- React
- MobX
- Bulma (css)
- Bulma-extensions
- Webpack
- Typescript
- Axios
- Stylus
- Jest
- SweetAlert2
- Fontawesome

for the full list see `package.json > dependencies`

## FAQ

**Warum dauert das Prüfen & Vergleichen so lange?**

Beim *Prüfen & Vergleichen* werden die Serien sequentiell (nacheinander) abgerufen, damit nicht zu viele Anfragen gleichzeitig gestellt werden (und Bs entlastet wird)

**Warum kann man nicht direkt auf die Folgen der Serie klicken?**

- Damit Bs noch Traffic bekommt (für Werbung etc.)
- Die Urls der Folgen ändern sich, wenn die übersetzt Version erscheint
- Das würde den globalen Zustand stark aufblähen (noch mal fast doppelt so groß?)