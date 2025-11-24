export const ALL_YEAR_INGREDIENTS: string[] = [
  "apples", "beets", "cabbage", "carrots", "chard",
  "collards", "garlic", "kale", "microgreens", "mushrooms",
  "onions", "potatoes", "shallots", "sweet potatoes"
];

export const SEASONAL_INGREDIENTS: Record<string, string[]> = {
  spring: ["asparagus", "peas", "spinach", "strawberries"],
  summer: ["tomatoes", "zucchini", "peaches", "corn", "blueberries"],
  fall: ["pumpkin", "apples", "brussels sprouts", "squash"],
  winter: ["kale", "sweet potatoes", "citrus", "root vegetables"],
};

export const MONTHLY_INGREDIENTS: Record<number, string[]> = {
  0: ["kalettes", "radishes"],
  1: ["herbs", "radishes", "scallions"],
  2: ["brussels sprouts", "celery root", "chestnuts", "kohlrabi", "leeks", "parsnips", "pears", "romanesco", "sunchokes", "turnips"],
  3: ["asparagus", "brussels sprouts", "green garlic", "morels", "nettles", "parsnips", "pea shoots", "ramps", "rhubarb", "spring onions", "strawberries", "sunchokes", "turnips"],
  4: ["asparagus", "dandelion greens", "garlic scapes", "green garlic", "morels", "nettles", "pea shoots", "ramps", "rhubarb", "snap peas", "snow peas", "sorrel", "strawberries", "vegetable starters"],
  5: ["apricots", "arugula", "cherries", "fava beans", "gooseberries", "lettuces", "radishes", "shelling peas", "snap peas", "snow peas", "strawberries"],
  6: ["blackberries", "cherries", "corn", "eggplant", "gooseberries", "ground cherries", "leeks", "melons", "nectarines", "okra", "peaches", "peppers", "shelling beans", "snap peas", "snow peas", "strawberries", "tomatillos"],
  7: ["blackberries", "celery", "corn", "edamame", "eggplant", "grapes", "leeks", "lima beans", "melons", "nectarines", "okra", "peaches", "peppers", "salad greens", "shelling beans", "tomatillos", "winter squash"],
  8: ["corn", "cucumbers", "currants", "eggplant", "figs", "grapes", "green beans", "melons", "okra", "pawpaws", "peaches", "peppers", "plums", "salad greens", "shelling beans", "summer squash", "tomatillos", "tomatoes"],
  9: ["arugula", "brussels sprouts", "chestnuts", "cucumbers", "eggplant", "fennel", "green beans", "kiwi berries", "parsnips", "peppers", "persimmons", "plums", "quince", "romanesco", "scallions", "shelling beans", "spinach", "summer squash", "sunchokes", "tomatillos", "tomatoes", "turnips"],
  10: ["arugula", "brussels sprouts", "chestnuts", "fennel", "parsnips", "persimmons", "quince", "romanesco", "scallions", "spinach", "sunchokes", "turnips"],
  11: ["broccoli", "kalettes", "quince"],
};