'use strict';

/**
 * On load event
 */
document.addEventListener('DOMContentLoaded', async() => {
    await updatePortfolio(true);

    // Add or update asset
    $('#add-asset').submit(async(e) => {
        e.preventDefault();
        let url = '/portfolio';
        let fetchOptions = {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                asset: {
                    symbol: $('#add-asset .symbol').val(),
                    quantity: $('#add-asset .qty').val(),
                },
            }),
        };

        await fetch(url, fetchOptions).then(async(response) => {
            if (response.status === 400) {
                showAlert('Cannot add this asset');
            } else {
                showAlert('Added succesfully');
                await updatePortfolio();
            }
        });
    });

    // Remove asset
    $('.delete_button').click(async(e) => {
        let symbol = e.target.id.substr(7);
        let url = '/portfolio';
        let fetchOptions = {
            credentials: 'same-origin',
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                asset: {
                    symbol: symbol,
                },
            }),
        };

        await fetch(url, fetchOptions).then(async(response) => {
            if (response.status === 400) {
                showAlert('Cannot remove this asset');
            } else {
                showAlert('Removed succesfully');
                $(`#asset-${symbol}`).remove();
            }
        });
    });
});

/**
 * Get portfolio via api then update or create the table.
 *
 * @param {bool} perpetual
 * @returns {Promise<void>}
 */
async function updatePortfolio(perpetual = false) {
    // Get portfolio data
    let response = await fetch('/portfolio', {
        credentials: 'same-origin',
    });
    let data = await response.json();

    // Sort by percents
    let percents = [];
    for (let asset in data.portfolio.assets) {
        percents.push([asset, data.portfolio.assets[asset].percent]);
    }
    percents.sort(([, a], [, b]) => b - a);

    // Show total and portfolio id
    $('#portfolio_id').text(`#${data.portfolio.user_id}`);
    changeNumber($('#total'), data.portfolio.total);

    // Reset list and show assets ordered
    let $assets = $('#assets');
    $('#loading').remove();
    percents.forEach(async([symbol]) => {
        let $asset = $(`#asset-${symbol}`);
        if ($asset.length) {
            changeNumber(
                $asset.find('.price'),
                data.portfolio.assets[symbol].price
            );
            changeNumber(
                $asset.find('.quantity'),
                data.portfolio.assets[symbol].quantity
            );
            changeNumber(
                $asset.find('.total'),
                data.portfolio.assets[symbol].total
            );
        } else {
            $assets.append(
                assetTemplate(
                    symbol,
                    numberFormat(data.portfolio.assets[symbol].price),
                    numberFormat(data.portfolio.assets[symbol].quantity),
                    numberFormat(data.portfolio.assets[symbol].total)
                )
            );
        }
    });

    if (perpetual) {
        setTimeout(
            await updatePortfolio,
            9000 + Math.floor(Math.random() * Math.floor(1000))
        );
    }
}

/**
 * Util for changing a number
 *  - Flash it red or green if the value has changed.
 *
 * @param {object} selector
 * @param {string} value
 */
function changeNumber(selector, value) {
    let oldValue = numberFormat(selector.text());
    let newValue = numberFormat(value);
    let delta = newValue - oldValue;

    if (delta !== 0) {
        selector.text(newValue);
        let color = delta > 0 ? 'green' : 'red';
        selector
            .addClass(`blink_${color}`)
            .one(
                'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function() {
                    selector.removeClass(`blink_${color}`);
                }
            );
    }
}

/**
 * Format a number for readability
 *
 * @param {string} number
 * @returns {string}
 */
function numberFormat(number) {
    number = Number.parseFloat(number);

    if (number >= 1) {
        return number.toFixed(2);
    }

    return number.toPrecision(3);
}

/**
 * Affiche une alerte
 *
 * @param {string} message
 * @param {string} type
 */
function showAlert(message) {
    let $alert = $('#alert');
    $alert.text(message);
    $alert.addClass('in');
    $alert.removeClass('d-none');
    window.setTimeout(() => {
        $alert.removeClass('in');
        $alert.addClass('d-none');
    }, 3000);
}

// Portfolio asset template
function assetTemplate(symbol, price, quantity, total) {
    return `<tr id="asset-${symbol}">
                <td><i class="fas fa-minus delete_button" id="delete-${symbol}"></i></td>
                <td class="text-left"><span class="symbol">${symbol}</span></td>
                <td class="text-right"><span class="price">${price}</span>€</td>
                <td class="text-right"><span class="quantity">${quantity}</span></td>
                <td class="text-right"><span class="total">${total}</span>€</td>
            </tr>`;
}
