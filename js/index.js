import { customLog, customError } from "./extensionLogging.js";

console.log = customLog("Product Info Extension:");
console.error = customError("Product Info Extension:");

const pageEl = document.querySelector("#js-page-url");
const button = document.querySelector("#js-refresh-button");

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
	const activeTab = tabs[0];
	chrome.tabs.sendMessage(
		tabs[0].id,
		{
			message: "GetPageData",
		},
		response => {
			initProductView({ page: response.message });
		},
	);

	button.addEventListener("click", () => {
		pageEl.innerText = "";

		const loaderEl = document.querySelector("#js-loader");

		loaderEl.classList.add("c-loader--open");

		initProductView({ url: activeTab?.url }).then(() => {
			loaderEl.classList.remove("c-loader--open");
		});
	});
});

// Create product detail view

const initProductView = async initConfig => {
	let responseData;

	if (!!initConfig?.url) {
		console.log("Getting from new request");
		const contentRequestUrl = createContentRequestUrl(initConfig.url);
		responseData = await requestContent(contentRequestUrl);
	} else if (!!initConfig?.page) {
		console.log("Getting from cache");
		responseData = initConfig.page;
	}

	if (responseData === null || responseData === undefined) {
		return;
	}

	// Insert content to div
	const list = createListElement(responseData.page);
	pageEl.appendChild(list);
};

const createListElement = product => {
	const tableEl = document.createElement("table");

	product = sortProductDetails(product);

	// Create the table elements
	const objectKeys = Object.keys(product);
	for (let counter = 0; counter <= objectKeys.length - 1; counter++) {
		const propKey = objectKeys[counter];

		let rowEl, cellKey, cellValue;
		rowEl = tableEl.insertRow(counter);

		// Insert Category row
		if (isCategoryTitle(propKey)) {
			const headerCell = document.createElement("th");
			headerCell.innerText = product[propKey];
			headerCell.classList.add("c-category-row__title");
			headerCell.setAttribute("colspan", "2");

			rowEl.appendChild(headerCell);
			rowEl.classList.add("c-category-row", "c-category-row--closed");
			rowEl.addEventListener("click", event => {
				event.currentTarget.classList.toggle("c-category-row--closed");
			});

			continue;
		}

		// Insert cells
		cellKey = rowEl.insertCell(0);
		cellKey.innerText = propKey;
		cellKey.classList.add("c-cell-key");

		cellValue = rowEl.insertCell(1);
		cellValue.innerText = product[propKey];
		cellValue.classList.add("c-cell-value");

		// Add copy detail value
		cellValue.addEventListener("click", () => {
			navigator.clipboard.writeText(product[propKey]);

			cellValue.classList.add("js-copied");

			setTimeout(() => cellValue.classList.remove("js-copied"), 1000);
		});
	}

	return tableEl;
};

const isCategoryTitle = key => {
	return key.startsWith("__");
};

const insertRow = tableEl => {
	let rowEl, cellKey, cellValue;
	rowEl = tableEl.insertRow(counter);

	cellKey = rowEl.insertCell(0);
	cellKey.innerText = objectKeys[counter];

	cellValue = rowEl.insertCell(1);
	cellValue.innerText = product[objectKeys[counter]];
};

const sortProductDetails = product => {
	const propertyPrio = [
		"courseTemplateID",
		"olympusCourseID",
		"nodeGUID",
		"courseType",
		"productType",
		"shouldCache",
		"documentCulture",
		"documentLanguage",
		"priceWithVAT",
		"priceWithoutVAT",
		"courseSource",
	];

	const productWithOrderedProps = {};

	// Set the prio's first
	propertyPrio.forEach(prop => {
		productWithOrderedProps[prop] = product[prop];
	});

	const restSeperator = { __categoryTitle: "Other properties" };

	// Merge the objects
	return { ...productWithOrderedProps, ...restSeperator, ...product };
};

// Request related

const requestContent = async url => {
	try {
		const response = await fetch(url, {
			headers: {
				"Cache-Control": "no-cache",
			},
		});

		if (response.status !== 200) {
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error("Product Info Extension", error);
		return null;
	}
};

const createContentRequestUrl = url => {
	const pageUrl = url;
	const parser = document.createElement("a");
	parser.href = pageUrl;

	const pagePath = encodeURIComponent(parser.pathname);

	return `${parser.origin}/content?url=${pagePath}%3F__preview-token`;
};
