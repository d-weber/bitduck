document.addEventListener("DOMContentLoaded", async () => {
    await updatePortfolio();
});

async function updatePortfolio() {
    // Get portfolio data
    let response = await fetch('/portfolio',{credentials: 'same-origin'});
    let data = await response.json();

    // Sort by percents
    let percents = [];
    for (let asset in data.portfolio.assets) {
        percents.push([asset, data.portfolio.assets[asset].percent])
    }
    percents.sort(([,a], [,b]) => b - a);

    // Show total and portfolio id
    $('#porfolio_id').text(`#${data.portfolio.user_id}`);
    changeNumber($('#total'), data.portfolio.total);

    // Reset list and show assets ordered
    let $assets = $('#assets');
    $('#loading').remove();
    percents.forEach(async ([symbol,]) => {
        let $asset = $(`#asset-${symbol}`);
        if ($asset.length) {
            changeNumber($asset.find('.price'), data.portfolio.assets[symbol].price);
            changeNumber($asset.find('.quantity'), data.portfolio.assets[symbol].quantity);
            changeNumber($asset.find('.total'), data.portfolio.assets[symbol].total);
        } else {
            $assets.append(template_asset(
                symbol,
                numberFormat(data.portfolio.assets[symbol].price),
                numberFormat(data.portfolio.assets[symbol].quantity),
                numberFormat(data.portfolio.assets[symbol].total)
            ));
        }
    });

    setTimeout(await updatePortfolio, 9000 + Math.floor(Math.random() * Math.floor(1000)));
}

function changeNumber(selector, value) {
    let old_value = numberFormat(selector.text());
    let new_value = numberFormat(value);
    let delta = new_value - old_value;

    if (delta !== 0) {
        selector.text(new_value);
        let color = delta > 0 ? 'green' : 'red';
        selector.addClass(`blink_${color}` ).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            selector.removeClass(`blink_${color}`);
        });
    }
}

function numberFormat(number) {
    number = Number.parseFloat(number);

    if (number >= 1) {
        return number.toFixed(2);
    }

    return number.toPrecision(3);
}

function addAsset(symbol, quantity) {

}

function showAlert(message) {
    let $alert = $('#alert');
    $alert.text(message);
    $alert.addClass('in');
    window.setTimeout(() => {
        $alert.removeClass('in');
    }, 3000)
}

// Templates
function template_asset(symbol, price, quantity, total) {
    return `<tr id="asset-${symbol}">
                <td><i class="fas fa-minus"></i></td>
                <td class="text-left"><span class="symbol">${symbol}</span></td>
                <td class="text-right"><span class="price">${price}</span>€</td>
                <td class="text-right"><span class="quantity">${quantity}</span></td>
                <td class="text-right"><span class="total">${total}</span>€</td>
            </tr>`;
}