

/**
 * Compress text string and result are encoded by base64
 * @param { string } text
 * @returns { Promise<any> } 
 */
async function textCompress(text) {
    const byteArray = new TextEncoder().encode(text);
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(byteArray);
    writer.close();

    const blob = await (new Response(cs.readable)).blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
    })
}
/**
 * 
 * @param { string } base64String 
 * @returns { Promise<string> }
 */
async function textDecompress(base64String) {
    // 1. Konwertuj ciąg Base64 na dane binarne (Blob)
    const dataUrl = `data:application/octet-stream;base64,${base64String}`;
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // 2. Dekompresuj dane za pomocą strumienia Gzip
    const ds = new DecompressionStream('gzip');
    const decompressedStream = blob.stream().pipeThrough(ds);

    // 3. Odczytaj strumień i zamień bajty z powrotem na tekst
    const decompressedBlob = await new Response(decompressedStream).blob();
    const arrayBuffer = await decompressedBlob.arrayBuffer();
    return new TextDecoder().decode(arrayBuffer);
}

/**
 * 
 * @param { string } text
 * @returns { string|Array } 
 */
function textSimplifier(text) {
    if(Array.isArray(text)) {
        return text;
    }
    return (text+"").toLowerCase().trim();
}

/**
 * @typedef {Object} ListItem
 * @property {boolean} checked - Whether the item is checked
 * @property {string} text - The text content of the item
 */

/**
 * @type {Object}
 * @property {string} name - The name of the list
 * @property {ListItem[]} items - Array of list items
 */
window.data_list = {
    name: "",
    items: []
};

function data_changed() {
    let data_str = JSON.stringify(window.data_list);
    console.log(data_str)
    

    textCompress(data_str).then( compressed => {
        const uri_compressed = encodeURIComponent(compressed);
        window.location.hash = uri_compressed;
    });
    
}



document.addEventListener('DOMContentLoaded', function () {

    const listNameInput = document.getElementById('list-name-input');
    const addItemListButton = document.getElementById('add-item-list-button');
    const itemsListContainer = document.getElementById('items-list-container');

    const copyUrlButton = document.getElementById('copy-url-button');
    const shareUrlButton = document.getElementById('share-url-button');

    copyUrlButton.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const url = window.location.href;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const old = copyUrlButton.textContent;
            copyUrlButton.textContent = 'Skopiowano!';
            setTimeout(() => copyUrlButton.textContent = old, 1500);
        } catch (err) {
            console.error('copy failed', err);
            alert('Nie udało się skopiować linku. Skopiuj ręcznie: ' + url);
        }
    });

    if (navigator.share) {
        shareUrlButton.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const url = window.location.href;
            const title = listNameInput.value || 'URL List';
            try {
                await navigator.share({ title, text: title, url });
            } catch (err) {
                console.error('share failed', err);
                alert('Udostępnianie nie powiodło się.');
            }
        });
    } else {
        if (shareUrlButton && shareUrlButton.parentNode) {
            shareUrlButton.parentNode.removeChild(shareUrlButton);
        }
    }

    const refreshListItems = () => {
        const existing_items = itemsListContainer.querySelectorAll('.item');
        if(existing_items.length != window.data_list.items.length) {
            existing_items.forEach( e => e.remove());
        }
        console.log(typeof window.data_list.items)
        window.data_list.items.forEach( ( item, index )=> {
            let container_item = document.createElement('div');
            container_item.classList.add('item');
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = window.data_list.items[index].checked;
            checkbox.addEventListener('change', function( ev ) {
                window.data_list.items[index].checked = ev.currentTarget.checked
                data_changed();
            })
            container_item.appendChild(checkbox);

            let text = document.createElement('input');
            text.type = "text";
            text.value = window.data_list.items[index].text;
            text.addEventListener('change', function( ev ) {
                window.data_list.items[index].text = textSimplifier(ev.currentTarget.value);
                data_changed();
            })
            container_item.appendChild(text)
            itemsListContainer.appendChild(container_item);
        })
    }

    let existingHash = window.location.hash;
    if(existingHash.startsWith('#')) {
        existingHash = existingHash.substring(1);
    }
    if(existingHash.length > 1) {
        let compressed = decodeURIComponent(existingHash);
        textDecompress(compressed).then( data_string => {
            let obj = null;
            try {
                obj = JSON.parse(data_string)
            }
            catch (err) {
                console.warn("Hash from url does not cotain valid json,", data_string);
                obj = null;
            }
            if(obj != null) {
                Object.keys(obj).forEach(oKey => {
                    window.data_list[oKey] = textSimplifier( obj[oKey] );
                });
                data_changed();
                listNameInput.value = window.data_list.name;
                console.log(window.data_list)
                refreshListItems();
            }
        })
    }



    listNameInput.addEventListener('change', function( ev ) {
        window.data_list.name =  textSimplifier( ev.currentTarget.value );
        ev.currentTarget.value = window.data_list.name;
        data_changed(); 
    });


    addItemListButton.addEventListener('click', function( ev ) {
        
        if (typeof window.data_list.items == 'string') {
            window.data_list.items = [];
        }

        window.data_list.items.push(
            { checked: false, text: "" }
        );
        refreshListItems();
        data_changed();
    } )




});