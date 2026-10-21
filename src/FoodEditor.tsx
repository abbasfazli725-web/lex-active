import type { Food } from "./model";
export default function FoodEditor({
  food,
  onSave,
}: {
  food: Food;
  onSave: (f: Food) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const entry = {
          ...food,
          name: String(f.get("name")).trim(),
          date: String(f.get("date")),
          meal: String(f.get("meal")),
          calories: Number(f.get("calories")),
          protein: Number(f.get("protein")),
          carbs: Number(f.get("carbs")),
          fat: Number(f.get("fat")),
        };
        if (
          !entry.name ||
          !entry.date ||
          [entry.calories, entry.protein, entry.carbs, entry.fat].some(
            (n) => !Number.isFinite(n) || n < 0,
          )
        )
          return;
        onSave(entry);
      }}
    >
      <label className="field">
        <span>Food or meal name</span>
        <input
          name="name"
          defaultValue={food.name}
          placeholder="e.g. Tofu rice bowl"
          required
          maxLength={100}
        />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Food date</span>
          <input name="date" type="date" defaultValue={food.date} required />
        </label>
        <label className="field">
          <span>Meal</span>
          <select name="meal" defaultValue={food.meal}>
            {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <p>
        Enter totals for the portion you ate, from its label or a trusted
        source. Values aren’t estimated.
      </p>
      <div className="form-grid">
        {[
          ["calories", "Calories (kcal)"],
          ["protein", "Protein (g)"],
          ["carbs", "Carbohydrates (g)"],
          ["fat", "Fat (g)"],
        ].map(([name, label]) => (
          <label className="field" key={name}>
            <span>{label}</span>
            <input
              name={name}
              required
              type="number"
              inputMode="decimal"
              min="0"
              max="100000"
              step="any"
              defaultValue={
                food.name
                  ? food[name as "calories" | "protein" | "carbs" | "fat"]
                  : ""
              }
            />
          </label>
        ))}
      </div>
      <button type="submit" className="button">
        Save food
      </button>
    </form>
  );
}
