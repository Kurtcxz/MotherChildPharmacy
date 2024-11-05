// Get the modal
var modal = document.getElementById("PurchaseForm");

// Get the button that opens the modal for new product
var btn = document.querySelector(".Create_PO");


// Get the close button
var closeBtn = document.getElementById("closeBtn");

// Get the notification elements
var notification = document.getElementById("notification");
var notificationMessage = document.getElementById("notificationMessage");
var closeNotification = document.getElementById("closeNotification");

// For tracking if this is an update or a new product
var isEditMode = false;
var currentItemId = null; // Store the ItemID when editing
var formClosedWithoutSubmission = false; // Flag to indicate if form was closed without submission

// When the user clicks the button, open the modal for new product
btn.onclick = function() {
    modal.style.display = "block";
    isEditMode = false; // Indicate that this is a new product
    document.getElementById('PurchaseForm').reset(); // Clear form fields
    document.getElementById('iconPreview').src = '../resources/img/add_icon.png'; // Reset icon preview

    // Fetch the next auto-increment value for ItemID
    fetch('getNextItemId.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('itemID').value = data.nextItemID; // Set the ItemID textbox with the next auto-increment value
            } else {
                console.error('Error fetching next ItemID:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching next ItemID:', error);
        });
};

var clearBtn = document.getElementById("Clear");

clearBtn.onclick = function() {
    var form = document.getElementById('PurchaseForm');
    Array.from(form.elements).forEach(element => {
        if (element.id !== 'itemID' && element.id !== 'iconFile') {
            if (element.type === 'text' || element.type === 'number' || element.type === 'select-one') {
                element.value = ''; 
            }
        }
    });
};
closeBtn.onclick = function() {
    formClosedWithoutSubmission = true; // Set the flag to indicate form was closed without submission
    modal.style.display = "none";
}

// Function to validate required fields

function validateForm() {
    const errors = [];
    
    // Check for required fields
    const itemType = document.getElementById('itemType').value;
    const pricePerUnit = document.getElementById('pricePerUnit').value.trim();
    const brandName = document.getElementById('brandName').value.trim();
    const genericName = document.getElementById('genericName').value.trim();
    const mass = document.getElementById('mass').value.trim();
    const unitOfMeasure = document.getElementById('unitOfMeasure').value;
    const productCode = document.getElementById('productCode').value.trim();
    
    if (!itemType) errors.push("Item Type is required.");
    if (!pricePerUnit) errors.push("Price Per Unit is required.");
    if (!brandName) errors.push("Brand Name is required.");
    if (!genericName) errors.push("Generic Name is required.");
    if (!mass) errors.push("Mass is required.");
    if (!unitOfMeasure) errors.push("Unit of Measure is required.");
    if (!productCode) errors.push("Product Code is required.");
    if (!Discount) errors.push("Discount is required.");

    return errors;
}


// HANDLE BOTH ADDING AND UPDATING


// Handle form submission

// Add event listener for form submission
// Add event listener for "New Product" button
// Disable the InStock field when the New Product button is clicked



const modalVerifyTextFront = document.getElementById('modalVerifyText-Front');

// UPDATE AND ADDING


// Function to add peso sign only if input is empty
function addPesoSign() {
    const priceInput = document.getElementById('pricePerUnit');
    if (priceInput.value.trim() === '') {
        priceInput.value = '₱ ';
    }
}

// Function to clean up input when focus is lost
function cleanPriceInput() {
    const priceInput = document.getElementById('pricePerUnit');
    if (priceInput.value === '₱ ') {
        priceInput.value = ''; // Clear if only peso sign is present
    }
}

document.getElementById('PurchaseForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('PurchaseForm');
    const formData = new FormData(form);

    // Extract and format `pricePerUnit` as a float to preserve decimals
    const priceInput = document.getElementById('pricePerUnit').value.replace('₱ ', '').trim();
    const pricePerUnitValue = parseFloat(priceInput).toFixed(2); // Retain 2 decimal places

    if (isNaN(pricePerUnitValue) || pricePerUnitValue <= 0) {
        showError('Price per unit must be a valid positive number.');
        return;
    }

    formData.set('pricePerUnit', pricePerUnitValue); // Update formData with parsed price

    // Submit form data via fetch
    const url = isEditMode ? 'updateInventory.php' : 'insertInventory.php';

    fetch(url, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const confirmationModal = new bootstrap.Modal(document.getElementById('disablebackdrop'));
                document.getElementById('modalVerifyTitle').textContent = 'Success';
                document.getElementById('modalVerifyText').textContent = isEditMode ? 
                    'Product has been updated successfully!' : 'Product has been added successfully!';
                confirmationModal.show();

                setTimeout(() => {
                    window.location.href = 'inventory.php';
                }, 1000);
            } else {
                showError('Error saving product: ' + data.message);
            }
        })
        .catch(error => {
            alert('An error occurred: ' + error.message);
        });
});




// Function to load form data for editing
function loadFormForEdit(item) {
    isEditMode = true; // Set to edit mode
    currentItemId = item.ItemID;

    document.getElementById('itemID').value = item.ItemID; // Set ItemID field as read-only
    document.getElementById('productCode').value = item.ProductCode;
    document.getElementById('genericName').value = item.GenericName;
    document.getElementById('brandName').value = item.BrandName;
    document.getElementById('itemType').value = item.ItemType;
    document.getElementById('mass').value = item.Mass;
    document.getElementById('unitOfMeasure').value = item.UnitOfMeasure;
    document.getElementById('pricePerUnit').value = item.PricePerUnit;
    document.getElementById('Discount').value = item.Discount;
    document.getElementById('VAT_exempted').value = item.VAT_exempted;
    
    // Set the values for InStock, Ordered, and ReorderLevel fields
    document.getElementById('InStock').value = item.InStock;
    document.getElementById('Ordered').value = item.Ordered;
    document.getElementById('ReorderLevel').value = item.ReorderLevel;

    // Set the icon preview
    document.getElementById('iconPreview').src = item.ProductIcon || '../resources/img/add_icon.png';

    modal.style.display = "block"; // Show the modal
}
















//Handle Image//


// Function to preview the selected image
function previewImage(event) {
    const iconPreview = document.getElementById('iconPreview');
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        const reader = new FileReader();
        
        // Set up the reader to update the image preview
        reader.onload = function(e) {
            iconPreview.src = e.target.result; // Update the image source with the file data
        }

        // Read the file as a Data URL
        reader.readAsDataURL(file);
    } else {
        // If no file is selected, set the default icon
        iconPreview.src = "../resources/img/add_icon.png";
    }
}

// Add event listener to the file input to trigger the image preview
document.getElementById('iconFile').addEventListener('change', previewImage);





//CLOSING FORM

// Function to close the form/modal
document.getElementById('closeBtn').addEventListener('click', function(event) {
    console.log('Close button clicked'); // Check if this logs
    event.preventDefault(); // Prevent any default behavior
    document.getElementById('PurchaseForm').style.display = 'none'; // Hide the form/modal
});

// Stop form submission if the close button is clicked
document.getElementById('closeBtn').addEventListener('click', function(event) {
    event.stopPropagation(); // Stop the click event from bubbling up to the form
});


// CLOSING FORM









// Function to show errors
function showError(message) {
    console.error(message);
    const notificationMessage = document.getElementById("notificationMessage");
    const notification = document.getElementById("notification");
    
    notificationMessage.textContent = message; // Set the error message
    notification.style.display = "block"; // Show the notification

    // Add event listener to the close button
    document.getElementById("closeNotification").addEventListener("click", closeError);
}


function closeError() {
    const notification = document.getElementById("notification");
    notification.style.display = "none"; // Hide the notification
}


// Function to hide the product fields
function hideProductFields() {
    document.querySelectorAll(
        'label[for="InStock"], label[for="Ordered"], label[for="ReorderLevel"], #InStock, #Ordered, #ReorderLevel'
    ).forEach(element => {
        element.style.display = 'none'; // Hide the element
    });
}

// Function to show the product fields
function showProductFields() {
    document.querySelectorAll(
        'label[for="InStock"], label[for="Ordered"], label[for="ReorderLevel"], #InStock, #Ordered, #ReorderLevel'
    ).forEach(element => {
        element.style.display = ''; // Show the element
    });
}


// Function to disable the product fields
function disableProductFields() {
    const fields = document.querySelectorAll('#InStock, #Ordered, #ReorderLevel');
    fields.forEach(field => {
        field.disabled = true; // Disable each input field
    });
}

// Event listener for the "New Product" button
document.getElementById('addProductButton').addEventListener('click', function() {
    hideProductFields(); // Hide the fields when the button is clicked
    // You may also want to open the form or do other actions here
});

// Function to handle update button click
function handleUpdate(itemId) {
    if (!itemId) {
        showError('Error: ItemID is missing.');
        return;
    }

    // Log the itemId for debugging
    console.log('Fetching data for ItemID:', itemId);

    // Call showProductFields to ensure the fields are visible
    showProductFields();

    fetch(`getProduct_data.php?itemID=${encodeURIComponent(itemId)}`)
        .then(response => {
            // Check if the response is OK
            if (response.ok) {
                // Check if the response is JSON
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(`Unexpected response: ${text}`);
                    });
                }
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            // Log the data for debugging
            console.log('Fetched data:', data);
        
            if (data.success) {
                // Load item data into the form
                loadFormForEdit(data.data);
        
                // Prepend the peso sign to the price input field
                const priceInput = document.getElementById('pricePerUnit');
                priceInput.value = '₱ ' + (data.data.PricePerUnit || ''); // Use a default if undefined
        
                // Now disable the fields after loading the data
                disableProductFields();
            } else {
                showError('Error fetching product data: ' + data.message);
            }
        })
}




// Function to initialize or reinitialize DataTables
function setDataTables() {
    if ($.fn.dataTable.isDataTable('#example')) {
        $('#example').DataTable().destroy(); // Destroy the existing instance before reinitializing
    }

    var table = $('#example').DataTable({
        "order": [], // Disable initial sorting
        "autoWidth": false, // Disable automatic column width calculation
        "responsive": true, // Enable responsiveness
        "columnDefs": [
            { "targets": 0, "width": "5%" }, // Item ID
            { "targets": 1, "width": "10%", "orderable": false }, // Icon 
            { "targets": 2, "width": "10%", "orderable": false }, // Generic Name
            { "targets": 3, "width": "10%", "orderable": false }, // Brand Name
            { "targets": 4, "width": "10%", "orderable": false }, // Item Type
            { "targets": 5, "width": "5%", "orderable": false }, // Mass & Unit of Measure
            { "targets": 6, "width": "10%" }, // Price Per Unit
            { "targets": 7, "width": "10%" }, // InStock
            { "targets": 8, "width": "10%" }, // Ordered
            { "targets": 9, "width": "100px", "orderable": false, "className": "text-center fixed-width" } // Actions
        ]
    });

    // Adjust table layout on sidebar toggle
    $(window).on('resize', function() {
        table.columns.adjust().draw(); // Redraw the DataTable to adjust the columns
    });
}

// Function to update the table with new data
function updateTable(items) {
    var tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    items.forEach(item => {
        var row = document.createElement('tr');
        row.setAttribute('data-id', item.ItemID); // Set data-id attribute

        row.innerHTML = `
                <td class="text-center text-truncate">${item.ItemID}</td>
                <td class="text-center"><img src="${item.ProductIcon}" alt="Icon" style="width: 50px; height: auto;"></td>
                <td class="text-center text-truncate">${item.GenericName}</td>
                <td class="text-center text-truncate">${item.BrandName}</td>
                <td class="text-center text-truncate">${item.ItemType}</td>
                <td class="text-center text-truncate">${item.Mass} ${item.UnitOfMeasure}</td>
                <td class="text-center text-truncate">₱ ${item.PricePerUnit}</td>
                <td class="text-center text-truncate">${item.InStock}</td>
                <td class="text-center text-truncate">${item.Ordered}</td>
                <td class="text-center">
                <img src="../resources/img/d-edit.png" alt="Edit" style="cursor:pointer; display: inline-block; width: 15px;" onclick="handleUpdate('${item.ItemID}')" />
                <img src="../resources/img/s-remove.png" alt="Delete" style="cursor:pointer; display: inline-block; width: 15px; margin-left: 10px;" onclick="showDeleteOptions('${item.ItemID}')" />
    </td>
        `;

        tableBody.appendChild(row);
    });
        //<td style="text-align: center;">${item.Status}</td>
        //img class="update-btn" onclick="handleUpdate(${item.ItemID})">Update</button>
        //<img class="delete-btn" onclick="handleDelete(${item.ItemID})">Delete</button>
    setDataTables(); // Reinitialize DataTables
}

// Function to handle delete operation
function handleDelete(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        fetch(`deleteProduct.php?itemID=${encodeURIComponent(itemId)}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    loadInventory(); // Reload the inventory table
                    location.reload();
                } else {
                    showError('Error deleting product: ' + data.message);
                }
            })
            .catch(error => {
                showError('An error occurred while deleting the product.');
            });
    }
}

// Function to load inventory data and refresh the table
function loadInventory() {
    console.log("Loading inventory..."); // Debugging line to check if this function is called
    fetch('getProduct_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateTable(data.data); // Update the table with fetched data
            } else {
                showError('Error fetching inventory data: ' + data.message);
            }
        })
        .catch(error => {
            showError('An error occurred while loading inventory data.');
        });
}

// Load inventory when the page loads
window.onload = loadInventory;


//////////////////////////Archive//////////////////////////////////
const overlayAD = document.getElementById('overlayAD');
const closeBtnAD = document.getElementById('closeBtnAD');
const archiveUserBtn = document.getElementById('archiveUserBtn');
const modalYes = document.getElementById('modalYes');
const modalVerifyTextAD = document.getElementById('modalVerifyText-AD');
const modalFooterAD = document.getElementById('modal-footer-AD');
const modalCloseAD = document.getElementById('modalClose-AD');

let selectedItemID = '';  // Store the selected product ID
let modalStatus = '';  // To store the status of the modal action

// Function to show the overlayAD modal
function showDeleteOptions(ItemID) {
    selectedItemID = ItemID;  // Store the selected item ID
    overlayAD.style.display = 'flex';  // Show the overlay
}

// Event listener for archive button click
archiveUserBtn.addEventListener('click', function () {
    modalVerifyTextAD.textContent = 'Are you sure you want to archive this product?';
    modalStatus = 'archive';  // Set the modal status to 'archive'
    
});

// Event listener for 'Yes' button in the modal
modalYes.addEventListener('click', function () {
    if (modalStatus === 'archive') {
        if (!selectedItemID || selectedItemID.trim() === '') {
            alert('No product selected.');
            return;
        }

        // Sending the archive request via fetch API
        fetch('ArchivingProd.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemID: selectedItemID }) // Sending itemID
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Product not found.');
                } else if (response.status === 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error('Error: ' + response.statusText);
                }
            }
            return response.json();
        })
        .then(data => {
            modalVerifyTextAD.textContent = data.message; // Display the response message
            modalFooterAD.style.display = 'none';
            modalCloseAD.style.display = 'none';
            modalVerifyTextAD.textContent = 'Product has been archived successfully!';
            document.getElementById('modalVerifyTitle-AD').textContent = 'Success';

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '../inventory/ArchiveProduct/ArchiveProd.php'; // Adjust URL if necessary
            }, 1000);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
});


// Event listener for close button (x) inside the modal
closeBtnAD.addEventListener('click', function () {
    overlayAD.style.display = 'none'; // Hide the overlay when the close button is clicked
    document.getElementById('disablebackdrop-AD').style.display = 'none'; // Hide the modal
});

// Optional: Click anywhere outside the modal to close it
window.addEventListener('click', function (event) {
    if (event.target === overlayAD) {
        overlayAD.style.display = 'none'; // Hide the modal if clicked outside of it
        document.getElementById('disablebackdrop-AD').style.display = 'none'; // Hide the modal
    }
});

// Redirect to archived users page
const toArchivedUsers = document.getElementById('toArchivedUsers');
toArchivedUsers.addEventListener('click', function () {
    window.location.href = 'ArchiveProduct/ArchiveProd.php';
});

// End of Archive

const FastmovingBtn = document.getElementById('FastmovingBtn');
FastmovingBtn.addEventListener('click', function () {
    window.location.href = 'Fastmoving.php';
});


// ECONOMIC ORDER QUANTITY //


// Function to truncate text
// Function to truncate text to a specified length
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text; // Append ellipsis if truncated
}

// Function to check low stock items

function checkLowStock() {
    const selectedView = document.getElementById("modalSelect").value;
    const lowStockItemsBody = document.getElementById('lowStockItemsBody');
    const tableHeader = document.getElementById("tableHeader");
    
    lowStockItemsBody.innerHTML = ''; // Clear previous items
    setTableHeaders(selectedView, tableHeader);

    fetchData(selectedView, lowStockItemsBody);
    
    document.getElementById("lowStockModal").style.display = "block"; 
}

function setTableHeaders(selectedView, tableHeader) {
    if (selectedView === 'lowStock') {
        tableHeader.innerHTML = `
            <th>Brand Name</th>
            <th>Generic Name</th>
            <th>In Stock</th>
            <th>Ordered</th>
            <th>Total Sold</th>
            <th>EOQ</th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th>Brand Name</th>
            <th>Generic Name</th>
            <th>Expiry Date</th>
            <th>Days to Expiry</th>
        `;
    }
}

function fetchData(selectedView, lowStockItemsBody) {
    $.ajax({
        url: selectedView === 'lowStock' ? 'checkLowStock.php' : 'checkNearExpiry.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            processFetchedData(data, selectedView, lowStockItemsBody);
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", status, error);
            lowStockItemsBody.innerHTML = `<tr><td colspan="6">Error connecting to server.</td></tr>`;
        }
    });
}

function processFetchedData(data, selectedView, lowStockItemsBody) {
    if (data.error) {
        console.error("Error: " + data.error);
        lowStockItemsBody.innerHTML = `<tr><td colspan="6">Error retrieving ${selectedView} items.</td></tr>`;
        return;
    }

    if (data.length > 0) {
        let hasItems = false;

        data.forEach(item => {
            const { ItemID, BrandName, GenericName, InStock = 0, Ordered = 0, totalSold = 0, ExpiryDate, DaysToExpiry } = item;

            // Process item and display in the table
            if (selectedView === 'lowStock' && shouldDisplayLowStock(InStock, Ordered)) {
                hasItems = true;
                appendLowStockRow(lowStockItemsBody, BrandName, GenericName, InStock, Ordered, totalSold);
            } else if (selectedView === 'nearExpiry') {
                hasItems = true;
                appendNearExpiryRow(lowStockItemsBody, BrandName, GenericName, ExpiryDate, DaysToExpiry);
            }
        });

        if (!hasItems) {
            lowStockItemsBody.innerHTML = `<tr><td colspan="${selectedView === 'lowStock' ? '6' : '4'}">All items are sufficiently stocked or not near expiry.</td></tr>`;
        }
    } else {
        lowStockItemsBody.innerHTML = `<tr><td colspan="${selectedView === 'lowStock' ? '6' : '4'}">No items found.</td></tr>`;
    }
}
function checkNearExpiry() {
    $.ajax({
        url: 'checkNearExpiry.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const lowStockItemsBody = document.getElementById('lowStockItemsBody');
            lowStockItemsBody.innerHTML = ''; // Clear previous items

            // Check for errors in the response
            if (data.error) {
                console.error("Error: " + data.error);
                lowStockItemsBody.innerHTML = `<tr><td colspan="4">Error retrieving near expiry items.</td></tr>`;
                return;
            }

            // Populate near expiry items
            if (data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="table-row" style="padding-left: 10px">${truncateText(item.BrandName, 20)}</td>
                        <td class="table-row" style="padding-left: 20px;">${truncateText(item.GenericName, 20)}</td>
                        <td class="table-row" style="padding-left: 10px;">${item.ExpiryDate}</td>
                        <td class="table-row" style="padding-left: 10px;">${item.LotNumber}</td>
                    `;
                    lowStockItemsBody.appendChild(row);
                });
            } else {
                lowStockItemsBody.innerHTML = `<tr><td colspan="4">No items nearing expiry.</td></tr>`;
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error: " + error);
            const lowStockItemsBody = document.getElementById('lowStockItemsBody');
            lowStockItemsBody.innerHTML = `<tr><td colspan="4">Error connecting to server.</td></tr>`;
            openModal(); // Ensure the modal opens even on error
        }
    });
}

function shouldDisplayLowStock(inStock, ordered) {
    const reorderLevel = Math.floor(ordered / 2); // Set reorder level to half of the ordered amount
    return parseInt(inStock, 10) <= reorderLevel; // Returns true if in stock is below or equal to reorder level
}

function appendLowStockRow(lowStockItemsBody, BrandName, GenericName, InStock, Ordered, totalSold) {
    const eoq = calculateEOQ(totalSold);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="table-row">${truncateText(BrandName, 20)}</td>
        <td class="table-row">${truncateText(GenericName, 20)}</td>
        <td class="table-row low-stock">${InStock}</td>
        <td class="table-row">${Ordered}</td>
        <td class="table-row">${totalSold}</td>
        <td class="table-row">${eoq}</td>
    `;
    lowStockItemsBody.appendChild(row);
}

function appendNearExpiryRow(lowStockItemsBody, BrandName, GenericName, ExpiryDate, DaysToExpiry) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="table-row">${truncateText(BrandName, 20)}</td>
        <td class="table-row">${truncateText(GenericName, 20)}</td>
        <td class="table-row">${ExpiryDate || 'N/A'}</td>
        <td class="table-row">${DaysToExpiry || 'N/A'}</td>
    `;
    lowStockItemsBody.appendChild(row);
}

function calculateEOQ(totalSold) {
    if (totalSold <= 0) return 0; // Return 0 if no sales
    const orderingCost = 50; // Example ordering cost
    const holdingCost = 2; // Example holding cost
    return Math.sqrt((2 * totalSold * orderingCost) / holdingCost).toFixed(2); // Calculate EOQ
}

function fetchSalesDataForPastYear() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'fetchSalesData.php', // Your PHP script to fetch sales data
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                resolve(data); // Resolve with fetched data
            },
            error: function(xhr, status, error) {
                reject(error); // Reject on error
            }
        });
    });
}

function updateReorderLevelInDatabase(itemId, newReorderLevel) {
    $.ajax({
        url: 'updateReorderLevel.php', // Your PHP script to update the reorder level
        method: 'POST',
        data: { itemId: itemId, reorderLevel: newReorderLevel },
        success: function(response) {
            console.log(`Updated ItemID ${itemId} with new Reorder Level: ${newReorderLevel}`);
        },
        error: function(xhr, status, error) {
            console.error(`Error updating reorder level for ItemID ${itemId}:`, error);
        }
    });
}

function calculateEOQ(totalSold) {
    if (totalSold <= 0) return 0; // Return 0 if no sales
    const orderingCost = 50; // Example ordering cost
    const holdingCost = 2; // Example holding cost
    return Math.sqrt((2 * totalSold * orderingCost) / holdingCost).toFixed(2); // Calculate EOQ
}

function updateTableView() {
    const selectedView = document.getElementById("modalSelect").value;
    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("lowStockItemsBody");

    // Clear the existing table headers and rows
    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    if (selectedView === "lowStock") {
        // Set headers for Low Stock Items view
        tableHeader.innerHTML = `
            <th style="text-align: left; padding: 8px;">Brand Name</th>
            <th style="text-align: left; padding: 8px;">Generic Name</th>
            <th style="text-align: left; padding: 8px;">In Stock</th>
            <th>Ordered</th>
            <th>EOQ</th>
        `;

        // Populate table with low stock data via AJAX
        checkLowStock(); 
        
    } else if (selectedView === "nearExpiry") {
        // Set headers for Near Expiry Items view
        tableHeader.innerHTML = `
            <th style="text-align: left; padding: 8px;">Brand Name</th>
            <th style="text-align: left; padding: 8px;">Generic Name</th>
            <th style="text-align: left; padding: 8px;">Expiry Date</th>
            <th style="text-align: left; padding: 8px;">Lot Number</th>
        `;

        // Populate table with near expiry data
        checkNearExpiry();
    }
}


//STATUS MODAL END

document.addEventListener('DOMContentLoaded', function () {
    // Open modal button event listener
    const openModalButton = document.getElementById('checkLowStockButton');
    if (openModalButton) {
        openModalButton.addEventListener('click', openModal);
    }

    // Close modal button event listener
    const closeButton = document.getElementById('BtnCloseLowStock');
    if (closeButton) {
        closeButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent propagation to parent elements
            console.log('Close button clicked'); // Debugging log
            closeModal();
        });
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('lowStockModal');
        if (event.target === modal) {
            closeModal();
        }
    });
});

// Open modal function
// Open modal function
function openModal() {
    const modal = document.getElementById('lowStockModal');
    modal.style.display = 'block'; // Show modal
    updateTableView();
}


// Close modal function
function closeModal() {
    const modal = document.getElementById('lowStockModal');
    modal.style.display = 'none'; // Hide modal
}




////////////////////////////////////////
// GOODS ISSUE PART///

function resetFormFields() {
    document.getElementById('selectProd').value = ''; // Clear the product selection
    document.getElementById('productSelect').innerHTML = ''; // Clear product dropdown options
    document.getElementById('productSelect').style.display = 'none'; // Hide the product dropdown

    document.getElementById('selectLot').value = ''; // Clear the lot number selection
    document.getElementById('lotSelect').innerHTML = ''; // Clear lot dropdown options
    document.getElementById('lotSelect').style.display = 'none'; // Hide the lot dropdown

    document.getElementById('QuantityRemaining').value = ''; // Reset QuantityRemaining field
    document.getElementById('orderedAmount').value = ''; // Reset Ordered amount field

    // Disable the lot number input field
    document.getElementById('selectLot').disabled = true; // Lock the lot number input field
}

// Event listener for the close button
document.getElementById('GIcloseBtn').addEventListener('click', function() {
    resetFormFields(); // Call the reset function when the exit button is clicked
    document.getElementById('overlayEdit1').style.display = 'none'; // Hide the modal overlay
});



    // Show the overlay when the Goods Issue button is clicked
    document.getElementById("GoodsIssueBtn").addEventListener("click", function () {
        document.getElementById("overlayEdit1").style.display = "flex";
    });

    // Close the overlay when the close button is clicked
    document.getElementById("GIcloseBtn").addEventListener("click", function () {
        closeEditOverlay();
    });


    

// Function to close the overlay and reset the form
function closeEditOverlay() {
    const form = document.getElementById('userFormEdit'); // Use the actual ID of your form
    if (form) {
        form.reset(); // Reset all form fields
    }

    const overlay = document.getElementById('overlayEdit1'); // Use the actual ID of your overlay
    if (overlay) {
        overlay.style.display = 'none'; // Hide the overlay
    }
}

function showProductDropdown() {
    const dropdown = document.getElementById('productSelect');
    dropdown.style.display = 'block'; // Show the dropdown when the input is clicked
    fetchAllProducts(); // Fetch all products to show in the dropdown
}

function filterOptions() {
    const input = document.getElementById('selectProd');
    const filter = input.value.toLowerCase();
    const dropdown = document.getElementById('productSelect');
    dropdown.innerHTML = ''; // Clear previous options

    // Clear ordered amount field if the input is empty
    if (filter === '') {
        resetOrderedField(); // Ensure this function resets the new field
        resetQuantityRemainingField();
        clearLot();
        return; // Stop function if input is empty
    }

    // AJAX request to fetch matching products
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `goodIssueGetData.php?query=${encodeURIComponent(filter)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const products = JSON.parse(xhr.responseText);
                const MAX_LENGTH = 50;

                dropdown.innerHTML = ''; // Clear previous options
                if (products.length > 0) {
                    const defaultOption = document.createElement('div');
                    defaultOption.classList.add('option');
                    defaultOption.textContent = 'Select a product';
                    defaultOption.onclick = () => {
                        input.value = ''; // Clear input if default is clicked
                        dropdown.style.display = 'none';
                        resetOrderedField(); // Reset ordered field on clear
                    };
                    dropdown.appendChild(defaultOption);

                    products.forEach(product => {
                        const option = document.createElement('div');
                        option.classList.add('option');
                        option.dataset.value = product.ItemID; // Store the ItemID
                        const displayText = `${product.GenericName} ${product.BrandName} (${product.Mass} ${product.UnitOfMeasure})`;
                        option.textContent = displayText.length > MAX_LENGTH 
                            ? displayText.substring(0, MAX_LENGTH - 3) + '...' 
                            : displayText;
                        option.onclick = function() {
                            selectProduct(option);
                        };
                        dropdown.appendChild(option);
                    });
                    dropdown.style.display = 'block'; // Show dropdown if results found
                }
            } else {
                console.error('Error fetching product data:', xhr.statusText);
            }
        }
    };
    xhr.send();
}

function fetchAllProducts() {
    const dropdown = document.getElementById('productSelect');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `goodIssueGetData.php?query=`, true); // Adjust the URL as needed
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const products = JSON.parse(xhr.responseText);
            const MAX_LENGTH = 50;

            dropdown.innerHTML = ''; // Clear previous options
            if (products.length > 0) {
                const defaultOption = document.createElement('div');
                defaultOption.classList.add('option');
                defaultOption.textContent = 'Select a product';
                defaultOption.onclick = () => {
                    const input = document.getElementById('selectProd');
                    input.value = ''; // Clear input if default is clicked
                    dropdown.style.display = 'none';
                    resetOrderedField(); // Reset ordered field on clear
                };
                dropdown.appendChild(defaultOption);

                products.forEach(product => {
                    const option = document.createElement('div');
                    option.classList.add('option');
                    option.dataset.value = product.ItemID; // Store the ItemID
                    const displayText = `${product.GenericName} ${product.BrandName} (${product.Mass} ${product.UnitOfMeasure})`;
                    option.textContent = displayText.length > MAX_LENGTH 
                        ? displayText.substring(0, MAX_LENGTH - 3) + '...' 
                        : displayText;
                    option.onclick = function() {
                        selectProduct(option);
                    };
                    dropdown.appendChild(option);
                });
                dropdown.style.display = 'block'; // Show dropdown if results found
            }
        }
    };
    xhr.send();
}


// Product selection enabling lot input
function selectProduct(option) {
    const input = document.getElementById('selectProd');
    input.value = option.textContent;
    currentSelectedItemID = option.dataset.value; // Store the selected ItemID
    document.getElementById('productSelect').style.display = 'none';

    // Enable the lot number input
    document.getElementById('selectLot').disabled = false; // Enable the selectLot input

    // Fetch product data and update ordered amount field
    fetchProductData(currentSelectedItemID);
}



function clearLot() {
    document.getElementById('selectLot').value = ''; // Clear QuantityRemaining field
}

// LOT 

function filterLotOptions() {
    const input = document.getElementById('selectLot');
    const filter = input.value.toLowerCase();
    const dropdown = document.getElementById('lotSelect');

    // Ensure dropdown exists and clear its content
    if (dropdown) {
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
    }

    if (filter === '') {
        resetQuantityRemainingField(); // Only clear QuantityRemaining when input is empty
        return; // Exit function
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `goodIssueGetData.php?lotQuery=${encodeURIComponent(filter)}`, true);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const lots = JSON.parse(xhr.responseText);
                const MAX_LENGTH = 50;

                if (lots.length > 0) {
                    const defaultOption = document.createElement('div');
                    defaultOption.classList.add('option');
                    defaultOption.textContent = 'Select a Lot Number';
                    defaultOption.onclick = () => {
                        input.value = '';
                        dropdown.style.display = 'none';
                        resetQuantityRemainingField(); // Clear QuantityRemaining when default is clicked
                    };
                    dropdown.appendChild(defaultOption);

                    lots.forEach(lot => {
                        const option = document.createElement('div');
                        option.classList.add('option');
                        option.dataset.value = lot.LotNumber;
                        option.dataset.quantity = lot.QuantityRemaining; // Store QuantityRemaining in data attribute

                        option.textContent = lot.LotNumber.length > MAX_LENGTH 
                            ? lot.LotNumber.substring(0, MAX_LENGTH - 3) + '...' 
                            : lot.LotNumber;

                        option.onclick = function() {
                            selectLot(option);
                        };
                        dropdown.appendChild(option);
                    });
                    dropdown.style.display = 'block';
                } else {
                    const noResultsOption = document.createElement('div');
                    noResultsOption.classList.add('option');
                    noResultsOption.textContent = 'No results found';
                    dropdown.appendChild(noResultsOption);
                    dropdown.style.display = 'block';
                }
            } else {
                console.error("Error fetching lots:", xhr.statusText);
            }
        }
    };
    
    xhr.send();
}


function selectLot(option) {
    const input = document.getElementById('selectLot');
    input.value = option.dataset.value; // Set the input value to the selected lot number
    document.getElementById('lotSelect').style.display = 'none'; // Hide the dropdown

    // Display QuantityRemaining in the appropriate field
    const quantityRemaining = option.dataset.quantity; // Get the quantity remaining from the data attribute
    document.getElementById('QuantityRemaining').value = quantityRemaining || 0; // Set QuantityRemaining to the input field

    // Set the currentLotNumber variable to the selected LotNumber
    currentLotNumber = option.dataset.value; // Store the selected LotNumber
    console.log(`Lot selected: ${currentLotNumber}, Quantity Remaining: ${quantityRemaining || 0}`);
}

// Function to reset the QuantityRemaining field (not defined in your provided code)
function resetQuantityRemainingField() {
    document.getElementById('QuantityRemaining').value = ''; // Clear QuantityRemaining field
}

function fetchProductData(itemID) {
    if (itemID) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `goodIssueGetData.php?itemID=${itemID}`, true);
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const productData = JSON.parse(xhr.responseText);
                    console.log(productData); // Debugging log

                    if (productData) {
                        // Update the Ordered input field with the fetched value
                        document.getElementById('orderedAmount').value = productData.Ordered || 0; // Update Ordered only
                    } else {
                        document.getElementById('orderedAmount').value = 0; // Set Ordered to 0 if no data found
                    }
                } else {
                    console.error('Error fetching product data:', xhr.statusText);
                    document.getElementById('orderedAmount').value = 0; // Reset Ordered on error
                }
            }
        };
        xhr.send();
    }
}

function resetOrderedField() {
    const orderedField = document.getElementById('orderedAmount'); // Use the new ID
    orderedField.value = ''; // Reset the value of the ordered amount field
}

// Separate function to reset the QuantityRemaining field
function resetQuantityRemainingField() {
    document.getElementById('QuantityRemaining').value = ''; // Clear QuantityRemaining
}
//Inserting Goods Issue

let isAddMode = true; // Default mode is Add
let currentSelectedItemID; // Declare a variable to hold the selected ItemID
let currentLotNumber; // Store the selected LotNumber

// Event listener for the Add button
document.getElementById('ToggleAdd').addEventListener('click', function() {
    isAddMode = true;
    this.style.backgroundColor = 'green'; 
    this.style.boxShadow = '0 0 10px green'; 
    document.getElementById('ToggleSub').style.backgroundColor = ''; 
    document.getElementById('ToggleSub').style.boxShadow = ''; 
});


// Event listener for the Subtract button
document.getElementById('ToggleSub').addEventListener('click', function() {
    isAddMode = false;
    this.style.backgroundColor = 'red'; 
    this.style.boxShadow = '0 0 10px red'; 
    document.getElementById('ToggleAdd').style.backgroundColor = ''; 
    document.getElementById('ToggleAdd').style.boxShadow = ''; 
});


// Get references to the input fields
const quantityInput = document.getElementById('Quantity');

// Add event listener to the Confirm button
document.getElementById('ConfirmAction').addEventListener('click', function() {
    const quantityInput = document.getElementById('Quantity');
    const quantity = parseInt(quantityInput.value, 10);
    const reason = document.getElementById('Reason').value;

    // Validate if fields are empty
    if (!quantityInput.value.trim() || !reason.trim()) {
        showNotification('Please fill in all required fields.'); // Show notification for empty fields
        console.error("One or more required fields are empty."); // Log error
        return;
    }

    // Validate quantity input
    if (isNaN(quantity) || quantity <= 0) {
        showNotification('Please enter a valid quantity.'); // Show error message using notification
        console.error("Invalid quantity entered."); // Log error
        return;
    }

    // Determine action based on isAddMode
    const action = isAddMode ? 'add' : 'subtract';

    // Prepare the data to send to the server
    const data = {
        itemID: currentSelectedItemID, // Ensure this is set before confirming
        lotNumber: currentLotNumber,     // Ensure this is set before confirming
        Quantity: quantity,
        reason: reason,                   // Use the actual reason input
        timestamp: new Date().toISOString(), // Use current timestamp
        action: action
    };

    // Send the data to the PHP script using fetch
    fetch('insertGoodIssue.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        console.log(result.message);
        
        // Display the response message in the modal
        modalVerifyTextAD.textContent = result.message; // Display the response message
        modalFooterAD.style.display = 'none';
        modalCloseAD.style.display = 'none';
        document.getElementById('modalVerifyTitle-AD').textContent = 'Success';

        // Show the success modal
        const successModal = new bootstrap.Modal(document.getElementById('disablebackdrop'));
        successModal.show();

        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'inventory.php'; // Redirect to inventory.php
        }, 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error: ' + error.message); // Show error message using notification
    });
});




// Function to show notification messages
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotification = document.getElementById('closeNotification');

    // Set the notification message
    notificationMessage.textContent = message;

    // Show the notification
    notification.style.display = 'block';

    // Close notification when the close button is clicked
    closeNotification.onclick = function() {
        notification.style.display = 'none';
    };

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}


// BARCODE SCANNER


// Function to handle the input from the barcode scanner
function handleBarcodeInput(event) {
    const productCodeInput = document.getElementById('productCode');
    
    // Wait for the 'Enter' key to process the barcode scan
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        
        // Process the full scanned code
        console.log('Scanned Barcode:', productCodeInput.value);
        
        // Here, add any additional processing, such as form submission or fetching product data
    }
}

// Attach the event listener for 'input' and 'keypress' events when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const productCodeInput = document.getElementById('productCode');
    
    // Only listen for the 'keypress' event to detect the 'Enter' key
    productCodeInput.addEventListener('keypress', handleBarcodeInput);
    
    // Ensure manual typing works by preventing key appending for each input
    productCodeInput.addEventListener('input', function() {
        // Placeholder for additional logic if needed on each input update
    });
});


