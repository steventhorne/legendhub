app.factory('breadcrumb', function() {
	function Breadcrumb() {
		this.links = [];
	}

	return new Breadcrumb();
});

app.factory('categories', function() {
	function Categories() {
		this.categories = [];
		this.subcategories = [];
		this.categoryNameProperty = "Name";
		this.subcategoryNameProperty = "Name";
		this.subcategoryCategoryProperty = "CategoryId";
		this.defaultId = -1;
		this.clearSelectedCategories();
	}

	/** @description Sets the options for the category service.
	 * @param {string} categoryNameProperty The name of the property that holds the category name.
	 * @param {string} subcategoryNameProperty The name of the property that holds the subcategory name.
	 * @param {string} subcategoryCategoryProperty The name of the property that holds the related categoryId for the subcategory.
	*/
	Categories.prototype.setOptions = function(categoryNameProperty, subcategoryNameProperty, subcategoryCategoryProperty, defaultId) {
		this.categoryNameProperty = categoryNameProperty;
		this.subcategoryNameProperty = subcategoryNameProperty;
		this.subcategoryCategoryProperty = subcategoryCategoryProperty;
		this.defaultId = defaultId;
	}

	/** @description Gets the category name via the given identifier.
	 * @param {number} id The identifier.
	 * @return {string} The category name.
	 */
	Categories.prototype.getCategoryName = function(id) {
		for (var i = 0; i < this.categories.length; ++i) {
			if (this.categories[i].Id == id) {
				return this.categories[i][this.categoryNameProperty];
			}
		}
		return '';
	}

	/** @description Gets the subcategory name via the given identifier.
	 * @param {number} id The identifier.
	 * @return {string} The subcategory name.
	*/
	Categories.prototype.getSubcategoryName = function(id) {
		for (var i = 0; i < this.subcategories.length; ++i) {
			if (this.subcategories[i].Id == id) {
				return this.subcategories[i][this.subcategoryNameProperty];
			}
		}
		return '';
	}

	/** @description Sets the categories for the service.
	 * @param {array} categories
	 */
	Categories.prototype.setCategories = function(categories) {
		this.categories = categories;
	}

	/** @description Sets the categories for the service.
	 * @param {array} subcategories
	 */
	Categories.prototype.setSubcategories = function(subcategories) {
		this.subcategories = subcategories;
	}

	/** @description Sets the current category.
	 * @param {number} id The Id of the category.
	 */
	Categories.prototype.setSelectedCategory = function(id) {
		if (id) {
			this.categoryId = id;
		}
	}

	/** @description Sets the current subcategory.
	 * @param {number} id The Id of the subcategory.
	 */
	Categories.prototype.setSelectedSubcategory = function(id) {
		if (id) {
			this.subcategoryId = id;
		}
	}

	/** @description Returns whether or not the selected category Id is valid.
	 * @returns {boolean}
	 */
	Categories.prototype.hasSelectedCategory = function() {
		return this.categoryId > this.defaultId;
	}

	/** @description Returns whether or not the selected subcategory Id is valid.
	 * @returns {boolean}
	 */
	Categories.prototype.hasSelectedSubcategory = function() {
		return this.subcategoryId > this.defaultId;
	}

	/** @description Gets the current category Id.
	 * @returns {number}
	 */
	Categories.prototype.getCategoryId = function() {
		return this.categoryId;
	}

	/** @description Gets the current subcategory Id.
	 * @returns {number}
	 */
	Categories.prototype.getSubcategoryId = function() {
		return this.subcategoryId;
	}

	/** @description Gets the current category name.
	 * @returns {number}
	 */
	Categories.prototype.getSelectedCategoryName = function() {
		return this.getCategoryName(this.categoryId);
	}

	/** @description Gets the current subcategory name.
	 * @returns {number}
	 */
	Categories.prototype.getSelectedSubcategoryName = function() {
		return this.getSubcategoryName(this.subcategoryId);
	}

	/** @description Gets the selected subcategory if selected, otherwise will get the selected category if selected. Used for displaying the category we're searching on.
	 * @returns {string}
	*/
	Categories.prototype.getActiveCategory = function() {
		if (this.categoryId && this.categoryId > this.defaultId) {
			if (this.subcategoryId && this.subcategoryId > this.defaultId) {
				return this.getSubcategoryName(this.subcategoryId);
			}
			return this.getCategoryName(this.categoryId);
		}
		return '';
	}

	/** @description Gets the subcategories that are under the selected category.
	 * @returns {array}
	 */
	Categories.prototype.getFilteredSubcategories = function() {
		if (this.categoryId) {
			var filtered = [];
			for (var i = 0; i < this.subcategories.length; ++i) {
				if (this.subcategories[i][this.subcategoryCategoryProperty] == this.categoryId) {
					filtered.push(this.subcategories[i]);
				}
			}
			return filtered;
		}

		return [];
	}

	/** @description Clears the selected categories. */
	Categories.prototype.clearSelectedCategories = function() {
		this.categoryId = this.defaultId;
		this.subcategoryId = this.defaultId;
	}

	return new Categories();
});
