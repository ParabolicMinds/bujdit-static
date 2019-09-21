function createModal(inputValues, inputClassName, setFocusObject)
{
	clear_element(modal)
	modalroot.style.display = null
	//Pass in an element, just like it would be done with createElement(), using children to populate the modal with stuff
	let modal_form = null
	if(inputValues && inputValues != null)
	{
		if(inputValues.className)
		{
			inputValues.className = 'modalFlexContainer ' + inputValues.className
		}
		else
		{
			inputValues.className = 'modalFlexContainer'
		}
		modal_form = createElement({ elementType: 'form', id: 'modalForm', className: 'modalForm ' + inputClassName, children: [ inputValues ] })
	}

	modal_form.addEventListener('submit', (evt) => {
		evt.preventDefault()
	})

	modal.appendChild(modal_form)
	if(setFocusObject) setFocus(setFocusObject)
}

function closeModal()
{
	clear_element(modal)
	modalroot.style.display = 'none'
}

function loginModal()
{
	let loginForm = { elementType: 'div', className: 'loginBox', children: [
			{ elementType: 'div', className: 'loginGrid', children: [
				{ elementType: 'span', text: 'Name:' },
				{ elementType: 'input', type: 'text', className: 'modalInput', id: 'bujditUsername', placeholder: 'Username', size: '14', spellcheck: false, autocorrect: false },
				{ elementType: 'span', text: 'Password:' },
				{ elementType: 'input', type: 'password', className: 'modalInput', id: 'bujditPassword', placeholder: 'Password', size: '14' }
			]},
			{ elementType: 'button', className: 'modalButton loginButton', onclick: loginButton, text: 'Log In' },
			{ elementType: 'div', text: 'Cancel', className: 'modalButton cancelButton', onclick: closeModal }
		]}

	createModal(loginForm, 'loginModal', 'bujditUsername')
}

function renderMainMenuSetingsModal()
{
	let new_modal = { elementType: 'div', children: [
		{ elementType: 'h3', text: 'Setings:' },
		{ elementType: 'div', style: {flex: '1 1 auto'} },
		{ elementType: 'div', text: 'OK!', className: 'modalButton okButton', onclick: null },
		{ elementType: 'div', text: 'Cancel', className: 'modalButton cancelButton', onclick: closeModal }
		] }
	createModal(new_modal, 'setingsModal', null)
}

function validateCreateForm(inputObjectID, command, userChosenColor)
{
	let test = document.getElementById(inputObjectID)
	if(test.value.trim() == '')
	{
		flashRed(document.getElementById(inputObjectID))
	}
	else
	{
		if(userChosenColor != undefined)
		{
			let color = document.getElementById(userChosenColor).value
			sendCommand({ cmd: command, name: test.value, meta: { userColor: color } }, checkModalFormSuccess)
		}
		else
		{
			sendCommand({ cmd: command, name: test.value }, checkModalFormSuccess)
		}
	}
}

function renderNewBujditModal()
{
	createItemModal('Bujdit', 'bujditModal', 'bujdit_create', '#77EE77')
}

function renderNewAcountModal()
{
	createItemModal('Acount', 'acountModal', 'acount_create', '#CCBB00')
}

function renderNewShnoppingListModal()
{
	createItemModal('Shnopping List', 'shnoppingListModal', 'shnopping_create', '#77AAEE')
}

function renderNewPayrolModal()
{
	createItemModal('Payrol', 'payrolModal', 'payrol_create', '#EE7700')
}

function renderNewCalednarModal(inputData)
{
	createCalednarModal(inputData)
}

function renderNewFrendModal()
{
	createItemModal('Frend', 'frendModal', 'frend_create', '#EE77EE')
}

function renderNewMessgaesModal()
{
	createItemModal('Messgae', 'messgaeModal', 'messgae_create', '#AAAAAA')
}

function createItemModal(itemName, modalClassName, inputCommand, inputColor, questionText)
{
	let new_modal = { elementType: 'div', children: [
		{ elementType: 'h3', text: 'New ' + itemName + ' name:' },
		{ elementType: 'input', id: 'createItemName', className: 'modalInput', size: 22, placeholder: 'Name' },
		{ elementType: 'div', className: 'colorPickerLine', text: 'Color: ', children: [
			{ elementType: 'input', type: 'color', value: inputColor, id: 'userColor', className: 'modalInput' },
			{ elementType: 'div', id: 'colorPickerSample', className: 'colorPickerSample' }
		] },
		{ elementType: 'div', style: {flex: '1 1 auto'} },
		{ elementType: 'div', text: 'Create!', className: 'modalButton createButton', onclick: ()=>{validateCreateForm('createItemName', inputCommand, 'userColor')} },
		{ elementType: 'div', text: 'Cancel', className: 'modalButton cancelButton', onclick: closeModal }
		] }
	createModal(new_modal, modalClassName, 'createItemName')
}

function createCalednarModal(inputDate, textInputArray)
{
	let new_modal = { elementType: 'div', children: [
		{ elementType: 'h3', text: months[inputDate.getMonth()] + ' ' + inputDate.getDate() + ', ' + inputDate.getFullYear() },
		] }

		for(let i = 0; i < textInputArray.length; i++)
		{
			new_modal.children.push({ elementType: 'div', style: textInputArray[i].style, text: textInputArray[i].text })
		}
	createModal(new_modal, 'calednarModal', 'createItemName')
}

function addShnoppingListItemModal()
{
	
}

function yesNoConfirmationModal(itemName, inputQuestion, modalClassName, inputFunction)
{
	let new_modal = { elementType: 'div', children: [
		{ elementType: 'h2', className: 'modalHighlight', text: itemName },
		{ elementType: 'h3', text: inputQuestion },
		{ elementType: 'div', style: {flex: '1 1 auto'} },
		{ elementType: 'div', text: 'Yes', className: 'modalButton yesButton', onclick: inputFunction },
		{ elementType: 'div', text: 'No', className: 'modalButton noButton', onclick: closeModal }
		] }
	createModal(new_modal, modalClassName, null)
}


function renderDeleteBujditModal(itemID, itemName)
{
	let className = 'bujditModal'
	let itemTitle = 'Bujdit'
	let deleteFunction = deleteBujdit
	yesNoConfirmationModal(itemName, 'Are you sure you want to delete this ' + itemTitle + '?', className, ()=>{ renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}

function renderDeleteShnoppingListModal(itemID, itemName)
{
	let className = 'shnoppingListModal'
	let itemTitle = 'Shnopping List'
	let deleteFunction = deleteShnoppingList
	yesNoConfirmationModal(itemName, 'Are you sure you want to delete this ' + itemTitle + '?', className, ()=>{ renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}

function renderDeletePayrolModal(itemID, itemName)
{
	let className = 'payrolModal'
	let itemTitle = 'Payrol'
	let deleteFunction = deletePayrol
	yesNoConfirmationModal(itemName, 'Are you sure you want to delete this ' + itemTitle + '?', className, ()=>{ renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}

function renderDeleteFrendModal(itemID, itemName)
{
	let className = 'FrendsModal'
	let itemTitle = 'Frend'
	let deleteFunction = deleteFrend
	yesNoConfirmationModal(itemName, 'Are you sure you want to delete this ' + itemTitle + '?', className, ()=>{ renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}

function renderDeleteMessgaesModal(itemID, itemName)
{
	let className = 'messgaesModal'
	let itemTitle = 'messgae'
	let deleteFunction = deleteMessgae
	yesNoConfirmationModal(itemName, 'Are you sure you want to delete this ' + itemTitle + '?', className, ()=>{ renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}


function renderSecondDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction)
{
	yesNoConfirmationModal(itemName, 'Are you ABSOLUTELY SURE you want to delete this ' + itemTitle + '?', className, ()=>{ renderThirdDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction) })
}

function renderThirdDeleteItemModal(itemID, itemName, className, itemTitle, deleteFunction)
{
	yesNoConfirmationModal(itemName, 'Are you 100% ABSOLUTELY POSITIVELY SURE? This operation CANNOT be undone!!1', className, ()=>{ deleteFunction(itemID) })
}

