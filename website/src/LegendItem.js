// Credit to tutorial from Youtube
// This is their git:  https://github.com/CodingWith-Adam/covid19-map
// Made modifications on their custom legend

class LegendItem {
  constructor(title, color, isFor, textColor) {
    this.title = title;
    this.color = color;
    this.isFor = isFor;
    this.textColor = textColor != null ? textColor : textColor;
  }
}

export default LegendItem;