/*
	Parallelism by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
//global variables
// storage for selected recipes
let cart = {};
// index for selected recipes
let index;

/*
------------------------
	Helper functions
------------------------
*/

// use clipboard api to copy ingredients/recipes to clipboard
async function copyObjToClipboard(ingredients) {
    // Convert the ingredients object to a formatted string
    let formattedString = formatGroupsForPrompt(ingredients);
    try {
        await navigator.clipboard.writeText(formattedString);
        console.log('Ingredients copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy ingredients:', err);
    }
}

// returns a div with the correct classes
function generateDivWithClass(className, mainCategory = "", subtext = "") {
	const Div = document.createElement('div');
	Div.className = `item intro ${className}`;
	Div.id = mainCategory;
	Div.innerHTML = `<h1>${mainCategory}</h1><p>${subtext}</p>`;
	return Div;
}

// returns an article with the correct classes and functions
function generateArticleWithClass(className, recipe) {
	const article = document.createElement('article');
	article.className = `item thumb ${className}`;
	article.innerHTML = `
			<h2>${recipe.Name}</h2>
			<a href="${recipe.Imgs[1]}" class="image" data-recipe-name="${recipe.Name}" onclick="setIndex(this.getAttribute('data-recipe-name'));">
				<img src="${recipe.Imgs[0]}" alt="${recipe.Name} img">
			</a>`;
	return article;
}

// clears/preps and returns the divs that created elements are inserted into
function get_divs() {
	// map divs into divs element
	const divIds = ['items-1', 'items-2', 'items-3'];
	const divs = divIds.map(id => document.getElementById(id));

	//clear existing inner html
	for (let div of divs) {
		div.innerHTML = "";
	}

	return divs;
}

// safey sets a variable that tracks which recipe is open
function setIndex(i) {
	index = i;
}

// Convert groups object to a readable format for the prompt
function formatGroupsForPrompt(groups) {
	let formatted = '';
	for (let key in groups) {
		formatted += `${key}: ${groups[key]}\n`;
	}
	return formatted;
}

// adds a custom recipe from user input
function addNewRecipe() {
	// Retrieve recipes from local storage or use an empty object if none exists
	let recipeDetails = JSON.parse(localStorage.getItem('recipeDetails')) || {};

	// Define recipe categories and their corresponding codes
	const groups = {
		'B': 'Beef',
		'C': 'Chicken',
		'L': 'Lamb',
		'P': 'Pasta and Rice',
		'V': 'Vegetarian',
		'S': 'Salad',
		'M': 'Misc',
		'D': 'Desserts'
	};

	// Prompt user for category until a valid category code is provided
	let group = "";
	while (!Object.keys(groups).includes(group.toUpperCase())) {
		group = prompt("Enter the main category:\n" + formatGroupsForPrompt(groups)).toUpperCase();
	}

	const category = groups[group];

	// Get recipe name from user
	let rname = prompt("Enter the name of the recipe: ");

	// Prompt user for the number of ingredients and ensure it's a valid number
	const ingredients = {};
	const ingredientNumStr = prompt("Enter the number of ingredients: ");
	let ingredientNum;
	try {
		ingredientNum = parseInt(ingredientNumStr, 10);
		if (isNaN(ingredientNum)) {
			throw new Error("Invalid input for the number of ingredients.");
		}
	} catch (error) {
		console.error(error.message);
		// Re-prompt or handle error as needed
	}

	// Collect each ingredient's name and quantity from the user
	for (let i = 0; i < ingredientNum; i++) {
		const name = prompt("Enter the ingredient name: ");
		const qty = prompt("Enter the quantity of " + name + ": ");
		try {
			ingredients[name] = parseInt(qty, 10);
			if (isNaN(ingredients[name])) {
				throw new Error("Enter a number for the quantity");
			}
		} catch (error) {
			console.error(error.message);
			// Re-prompt or handle error as needed
		}
	}

	// Generate image filenames based on recipe name
	const img = rname.replace(' ', '_').toLowerCase() + ".jpg";

	// Construct the new recipe object
	const newRecipe = {
		"Name": rname,
		"Ingredients": ingredients,
		"Instructions": [],
		"Imgs": [
			`images/recipe_photos/front/${img}`,
			`images/recipe_photos/back/${img}`
		]
	};

	// Add the new recipe to the recipeDetails object
	if (category in recipeDetails) {
		recipeDetails[category].push(newRecipe);
	} else {
		recipeDetails[category] = [newRecipe];
	}

	// Save the updated recipes back to local storage
	localStorage.setItem('recipeDetails', JSON.stringify(recipeDetails));
}

// clear all custom recipes
function clear_recipes() {
	let confirmation = prompt("Are you sure you want to remove all custom recipes you have created? (Y/N)")
	if (confirmation[0].toUpperCase() === "Y") {
		localStorage.setItem('recipeDetails', null);
	} else {
		alert('Custom recipes were not removed');
	}
}

// Adds a recipe to the cart. If the recipe already exists, it increments its quantity.
function add_recipe(recipeName) {
	let recipeFound = false;
	// Iterate through each category in recipe details
	for (const category in recipe_details) {
		// Ensure the property belongs to the recipe_details object
		if (recipe_details.hasOwnProperty(category)) {
			// Find the recipe by its name
			const recipe = recipe_details[category].find(r => r.Name === recipeName);

			// If found, add or update it in the cart
			if (recipe) {
				recipeFound = true;
				if (cart.hasOwnProperty(recipeName)) {
					cart[recipeName].quantity += 1;
				} else {
					cart[recipeName] = {
						recipe: recipe,
						quantity: 1
					};
				}
				alert('Added: ' + recipeName);
				break;
			}
		}
	}

	// If the recipe was not found, alert the user
	if (!recipeFound) {
		alert('Recipe not found: ' + recipeName);
	}
}


// Removes a recipe from the cart. Decrements the quantity if more than one.
function remove_recipe(recipeName) {
	// Check if the recipe exists in the cart
	if (cart.hasOwnProperty(recipeName)) {
		cart[recipeName].quantity--;

		// Remove the recipe from the cart if its quantity drops to zero or below
		if (cart[recipeName].quantity <= 0) {
			delete cart[recipeName];
		}

		alert('Removed: ' + recipeName);
	} else {
		alert('Cannot remove: Recipe not found in cart');
	}
}

/*
------------------------
	Main functions
------------------------
*/
// adds the recipes to the page ordered by groups
function populate() {
	// load custom recipes stored on local web storage and merge with existing recipes
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
	//loops through each mainCategory and divides them into 3 arrays
	const divs = get_divs();
	for (let mainCategory in recipe_details) {
		let itemsArr = [
			[],
			[],
			[]
		];
		const recipes = recipe_details[mainCategory];
		const totalRecipes = recipes.length;
		const itemsPerDiv = Math.floor(totalRecipes / 3);
		const remainder = totalRecipes % 3;
		// Create the 'title' div element for each mainCategory
		if (recipes.length > 0) {
			const categoryDiv = generateDivWithClass('span-1', mainCategory);
			itemsArr[0].push(categoryDiv);
		}
		// create the recipes and spread them into 3 arrays
		for (let i = 0; i < recipes.length; i++) {
			const recipe = generateArticleWithClass('span-1', recipes[i]);
			if (i < itemsPerDiv || (i === itemsPerDiv * 3 && remainder === 1)) {
				itemsArr[0].push(recipe);
			} else if (i < itemsPerDiv * 2 || (i === itemsPerDiv * 3 + 1 && remainder === 2)) {
				itemsArr[1].push(recipe);
			} else {
				itemsArr[2].push(recipe);
			}
		}
		// Balance between the first two arrays if they are unbalanced by more than 1
		if (itemsArr[0].length - itemsArr[1].length > 1) {
			itemsArr[1].push(itemsArr[0].pop());
		}
		// Add empty divs to balance out the lengths of the arrays
		const maxItems = Math.max(...itemsArr.map(arr => arr.length));
		itemsArr.slice(1).forEach(arr => {
			while (arr.length < maxItems) {
				arr.push(generateDivWithClass('span-1'));
			}
		});
		itemsArr.forEach((arr, index) => arr.forEach(item => divs[index].appendChild(item)));
	}
	refresh();
}


// shows the selected recipes
function populate_cart() {
	const divs = get_divs();
	let itemsArr = [
		[],
		[],
		[]
	];
	let i = 0;
	// Check if the cart is empty
	if (Object.keys(cart).length === 0) {
		const div = generateDivWithClass(
			'span-3',
			"Empty cart.",
			`It appears your cart is empty.<br><a onclick="populate();" title="display recipes">Click here to go back to the recipe page.</a>`
		);
		itemsArr[0].push(div);
	} else {
		const div = generateDivWithClass(
			'span-3',
			"Copy recipes",
			`Here, you will be able to copy your<br><a onclick="copyObjToClipboard(cart);" title="Copy to clipboard">selected recipes and their amounts.</a>`
		);
		itemsArr[0].push(div);
	}

	// spreads the recipes into 3 arrays
	for (const recipeName in cart) {
		if (cart.hasOwnProperty(recipeName)) {
			const recipe = cart[recipeName].recipe;
			const article = generateArticleWithClass('span-3', recipe);
			switch (i % 3) {
				case 0:
					itemsArr[0].push(article);
					break;
				case 1:
					itemsArr[1].push(article);
					break;
				case 2:
					itemsArr[2].push(article);
					break;
			}
			i++;
		}
	}
	// Balance between the first two arrays if they are unbalanced by more than 1
	for (let i = 1; i <= 2; i++) {
		while (itemsArr[0].length - itemsArr[i].length > 1) {
			itemsArr[i].push(itemsArr[0].pop());
		}
	}
	// Add empty divs to balance out the lengths of the arrays
	const maxItems = Math.max(...itemsArr.map(arr => arr.length));
	itemsArr.forEach((arr, idx) => {
		while (arr.length < maxItems) {
			arr.push(generateDivWithClass('span-3'));
		}
	});
	itemsArr.forEach((arr, index) => arr.forEach(item => divs[index].appendChild(item)));
	refresh();
}

// shows the ingredients needed for the selected recipes
function populate_ingredient() {
	const divs = get_divs();
	let itemsArr = [
		[],
		[],
		[]
	];
	let i = 0;
	const allIngredients = {};
	// Check if the cart is empty
	if (Object.keys(cart).length === 0) {
		const div = generateDivWithClass(
			'span-1',
			"Empty cart.",
			`It appears your cart is empty.<br><a onclick="populate();" title="display recipes">Click here to go back to the recipe page.</a>`
		);
		itemsArr[0].push(div);
	} else {
		const div = generateDivWithClass(
			'span-1',
			"Copy Ingredients",
			`Here, you will be able to copy your<br><a onclick="copyObjToClipboard(cart);" title="Copy to clipboard">selected Ingredients for your recipes.</a>`
		);
		itemsArr[0].push(div);
	}
	// inserts the ingredients into a single dictonary
	for (const recipeName in cart) {
		if (cart.hasOwnProperty(recipeName)) {
			const recipe = cart[recipeName].recipe;
			for (const [ingredient, amount] of Object.entries(recipe.Ingredients)) {
				allIngredients[ingredient] = (allIngredients[ingredient] || 0) + amount;
			}
		}
	}
	// spreads the ingredients into 3 arrays
	for (const ingredient in allIngredients) {
		if (allIngredients.hasOwnProperty(ingredient)) {
			const amount = allIngredients[ingredient];
			const div = generateDivWithClass('span-1', ingredient, `Quantity: ${amount}`);
			switch (i % 3) {
				case 0:
					itemsArr[0].push(div);
					break;
				case 1:
					itemsArr[1].push(div);
					break;
				case 2:
					itemsArr[2].push(div);
					break;
			}
		}
		i++;
	}
	// Balance between the first two arrays if they are unbalanced by more than 1
	for (let i = 1; i <= 2; i++) {
		while (itemsArr[0].length - itemsArr[i].length > 1) {
			itemsArr[i].push(itemsArr[0].pop());
		}
	}
	// Add empty divs to balance out the lengths of the arrays
	const maxItems = Math.max(...itemsArr.map(arr => arr.length));
	itemsArr.forEach((arr, idx) => {
		while (arr.length < maxItems) {
			arr.push(generateDivWithClass('span-1'));
		}
	});
	itemsArr.forEach((arr, index) => arr.forEach(item => divs[index].appendChild(item)));
	refresh();
}

// refreshes the code in the back
function refresh() {
	(function($) {
		var $window = $(window),
			$body = $('body'),
			$wrapper = $('#wrapper'),
			$main = $('#main'),
			settings = {
				// Keyboard shortcuts.
				keyboardShortcuts: {
					// If true, enables scrolling via keyboard shortcuts.
					enabled: true,
					// Sets the distance to scroll when using the left/right arrow keys.
					distance: 50
				},
				// Scroll wheel.
				scrollWheel: {
					// If true, enables scrolling via the scroll wheel.
					enabled: true,
					// Sets the scroll wheel factor. (Ideally) a value between 0 and 1 (lower = slower scroll, higher = faster scroll).
					factor: 1
				},
				// Scroll zones.
				scrollZones: {
					// If true, enables scrolling via scroll zones on the left/right edges of the scren.
					enabled: true,
					// Sets the speed at which the page scrolls when a scroll zone is active (higher = faster scroll, lower = slower scroll).
					speed: 15
				}
			};
		// Breakpoints.
		breakpoints({
			xlarge: ['1281px', '1680px'],
			large: ['981px', '1280px'],
			medium: ['737px', '980px'],
			small: ['481px', '736px'],
			xsmall: [null, '480px'],
		});
		// Tweaks/fixes.
		// Mobile: Revert to native scrolling.
		if (browser.mobile) {
			// Disable all scroll-assist features.
			settings.keyboardShortcuts.enabled = false;
			settings.scrollWheel.enabled = false;
			settings.scrollZones.enabled = false;
			// Re-enable overflow on main.
			$main.css('overflow-x', 'auto');
		}
		// IE: Fix min-height/flexbox.
		if (browser.name == 'ie')
			$wrapper.css('height', '100vh');
		// iOS: Compensate for address bar.
		if (browser.os == 'ios')
			$wrapper.css('min-height', 'calc(100vh - 30px)');
		// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});
		// Items.
		// Assign a random "delay" class to each thumbnail item.
		$('.item.thumb').each(function() {
			$(this).addClass('delay-' + Math.floor((Math.random() * 6) + 1));
		});
		// IE: Fix thumbnail images.
		if (browser.name == 'ie')
			$('.item.thumb').each(function() {
				var $this = $(this),
					$img = $this.find('img');
				$this
					.css('background-image', 'url(' + $img.attr('src') + ')')
					.css('background-size', 'cover')
					.css('background-position', 'center');
				$img
					.css('opacity', '0');
			});
		$main.poptrox({
			overlayColor: '#1a1f2c',
			overlayOpacity: 0.75,
			popupCloserText: '',
			popupLoaderText: '',
			selector: '.item.thumb a.image',
			caption: function($a) {
				return $a.prev('h2').html();
			},
			usePopupDefaultStyling: false,
			usePopupCloser: false,
			usePopupCaption: true,
			usePopupNav: true,
			windowMargin: 50,
			onPopupOpen: function() {
				$body.addClass('is-poptrox-visible');
				// Add the "Add" and "Remove" buttons when the popup opens
				$('.poptrox-popup')
					.append('<button class="add-button">Add</button>')
					.append('<button class="remove-button">Remove</button>');
				$('.add-button').click(function() {
					add_recipe(index);
				});
				$('.remove-button').click(function() {
					remove_recipe(index);
				});
			},
			onPopupClose: function() {
				$body.removeClass('is-poptrox-visible');
				$('.add-button, .remove-button').remove();
			}
		});
		breakpoints.on('>small', function() {
			$main[0]._poptrox.windowMargin = 50;
		});
		breakpoints.on('<=small', function() {
			$main[0]._poptrox.windowMargin = 0;
		});
		// Keyboard shortcuts.
		if (settings.keyboardShortcuts.enabled)
			(function() {
				$window
					// Keypress event.
					.on('keydown', function(event) {
						var scrolled = false;
						if ($body.hasClass('is-poptrox-visible'))
							return;
						switch (event.keyCode) {
							// Left arrow.
							case 37:
								$main.scrollLeft($main.scrollLeft() - settings.keyboardShortcuts.distance);
								scrolled = true;
								break;
								// Right arrow.
							case 39:
								$main.scrollLeft($main.scrollLeft() + settings.keyboardShortcuts.distance);
								scrolled = true;
								break;
								// Page Up.
							case 33:
								$main.scrollLeft($main.scrollLeft() - $window.width() + 100);
								scrolled = true;
								break;
								// Page Down, Space.
							case 34:
							case 32:
								$main.scrollLeft($main.scrollLeft() + $window.width() - 100);
								scrolled = true;
								break;
								// Home.
							case 36:
								$main.scrollLeft(0);
								scrolled = true;
								break;
								// End.
							case 35:
								$main.scrollLeft($main.width());
								scrolled = true;
								break;
						}
						// Scrolled?
						if (scrolled) {
							// Prevent default.
							event.preventDefault();
							event.stopPropagation();
							// Stop link scroll.
							$main.stop();
						}
					});
			})();
		// Scroll wheel.
		if (settings.scrollWheel.enabled)
			(function() {
				// Based on code by @miorel + @pieterv of Facebook (thanks guys :)
				// github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
				var normalizeWheel = function(event) {
					var pixelStep = 10,
						lineHeight = 40,
						pageHeight = 800,
						sX = 0,
						sY = 0,
						pX = 0,
						pY = 0;
					// Legacy.
					if ('detail' in event)
						sY = event.detail;
					else if ('wheelDelta' in event)
						sY = event.wheelDelta / -120;
					else if ('wheelDeltaY' in event)
						sY = event.wheelDeltaY / -120;
					if ('wheelDeltaX' in event)
						sX = event.wheelDeltaX / -120;
					// Side scrolling on FF with DOMMouseScroll.
					if ('axis' in event &&
						event.axis === event.HORIZONTAL_AXIS) {
						sX = sY;
						sY = 0;
					}
					// Calculate.
					pX = sX * pixelStep;
					pY = sY * pixelStep;
					if ('deltaY' in event)
						pY = event.deltaY;
					if ('deltaX' in event)
						pX = event.deltaX;
					if ((pX || pY) &&
						event.deltaMode) {

						if (event.deltaMode == 1) {
							pX *= lineHeight;
							pY *= lineHeight;
						} else {
							pX *= pageHeight;
							pY *= pageHeight;
						}
					}
					// Fallback if spin cannot be determined.
					if (pX && !sX)
						sX = (pX < 1) ? -1 : 1;
					if (pY && !sY)
						sY = (pY < 1) ? -1 : 1;
					// Return.
					return {
						spinX: sX,
						spinY: sY,
						pixelX: pX,
						pixelY: pY
					};
				};
				// Wheel event.
				$body.on('wheel', function(event) {
					// Disable on <=small.
					if (breakpoints.active('<=small'))
						return;
					// Prevent default.
					event.preventDefault();
					event.stopPropagation();
					// Stop link scroll.
					$main.stop();
					// Calculate delta, direction.
					var n = normalizeWheel(event.originalEvent),
						x = (n.pixelX != 0 ? n.pixelX : n.pixelY),
						delta = Math.min(Math.abs(x), 150) * settings.scrollWheel.factor,
						direction = x > 0 ? 1 : -1;
					// Scroll page.
					$main.scrollLeft($main.scrollLeft() + (delta * direction));
				});
			})();
		// Scroll zones.
		if (settings.scrollZones.enabled)
			(function() {
				var $left = $('<div class="scrollZone left"></div>'),
					$right = $('<div class="scrollZone right"></div>'),
					$zones = $left.add($right),
					paused = false,
					intervalId = null,
					direction,
					activate = function(d) {
						// Disable on <=small.
						if (breakpoints.active('<=small'))
							return;
						// Paused? Bail.
						if (paused)
							return;
						// Stop link scroll.
						$main.stop();
						// Set direction.
						direction = d;
						// Initialize interval.
						clearInterval(intervalId);
						intervalId = setInterval(function() {
							$main.scrollLeft($main.scrollLeft() + (settings.scrollZones.speed * direction));
						}, 25);
					},
					deactivate = function() {
						// Unpause.
						paused = false;
						// Clear interval.
						clearInterval(intervalId);
					};
				$zones
					.appendTo($wrapper)
					.on('mouseleave mousedown', function(event) {
						deactivate();
					});
				$left
					.css('left', '0')
					.on('mouseenter', function(event) {
						activate(-1);
					});
				$right
					.css('right', '0')
					.on('mouseenter', function(event) {
						activate(1);
					});
				$body
					.on('---pauseScrollZone', function(event) {
						// Pause.
						paused = true;
						// Unpause after delay.
						setTimeout(function() {
							paused = false;
						}, 500);
					});
			})();
	})(jQuery);
}

//call the populate function on load
populate();