function get_recipes() {
	let recipeDetails = JSON.parse(localStorage.getItem('recipeDetails')) || {};
	for (let category in recipeDetails) {
		if (recipeDetails[category].length > 0) {
			if (recipe_details[category]) {
				recipe_details[category] = [...recipe_details[category], ...recipeDetails[category]];
			} else {
				recipe_details[category] = [...recipeDetails[category]];
			}
		}
	}
	console.log(recipe_details);
}
async function copyObjToClipboard(ingredients) {
    // Convert the ingredients object to a formatted string
    let formattedString = formatGroupsForPrompt(ingredients);
    try {
        await navigator.clipboard.writeText(formattedString);
        console.log('Ingredients copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy recipes:', err);
    }
}
copyObjToClipboard(get_recipes());