# sephora scrape in store purchases

NOTICE: This was for fun but got lazy on fixing "Token expired or random number not match. Please try again." after submitting the form. I'll leave this here for anyone who wants to continue.

Before embarking on this journey, I was able to scrape the date in the browser console once logged in on the [purchase history](https://www.sephora.com/purchase-history) page. Here's the code to run in there for the same results. Recommend loading as much content as your looking for via "Show more" button. Could be easier ways but this took less than 3 mins.

```javascript
function parseItems() {
    const items = document.querySelectorAll('div[data-at="purchase_history_item"]'); 
    const parsedItems = [];

    items.forEach(item => {
        const brand = item.querySelector('span[data-at="sku_item_brand"]')?.innerText; 
        const itemName = item.querySelector('span[data-at="sku_item_name"]')?.innerText;
        const price = item.querySelector('span[data-at="sku_item_price_list"]')?.innerText; 

        if (brand && itemName && price) {
            parsedItems.push({ brand, itemName, price }); 
        }
    });

    console.log(parsedItems);
    return parsedItems;
}

parseItems();
```

## Overview

This is a simple scraper to get your in-store purchase history from Sephora. It uses Puppeteer to scrape the data from the website.

## Getting Started

1. Install the required packages

    ```zsh
    pnpm install
    ```

2. Create a `.env` file in the root of the project and add the following:

    ```zsh
    cp .env.example .env
    ```

    Then fill in the `USERNAME` and `PASSWORD` fields with your Sephora account credentials.

3. Run the scraper

    ```zsh
    pnpm start
    ```

## Output

The output will be a JSON file with the name `output.json`