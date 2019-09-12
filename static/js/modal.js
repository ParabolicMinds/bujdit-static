function createModal(setFocusObject, inputValues)
{
	clear_element(modal)
	modalroot.style.display = null
	//Pass in a div element, just like it would be done with createElement(), using children to populate the modal with stuff
	let modal_form = null
	if(inputValues && inputValues != null)
	{
		modal_form = (createElement(inputValues))
	}

	modal.appendChild(modal_form)
	if(setFocusObject != '' && setFocusObject != null && document.getElementById(setFocusObject))
	{
		document.getElementById(setFocusObject).focus()
	}
}

function closeModal()
{
	clear_element(modal)
	modalroot.style.display = 'none'
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
	createItemModal('Shnopping List', 'newShnoppingListModal', 'shnoppingList_create', '#77AAEE')
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
	let new_modal = { elementType: 'div', className: 'modalForm ' + modalClassName, children: [
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
	createModal('newBujditName', new_modal)
	document.getElementById('createItemName').focus()
}

function createCalednarModal(inputDate, textInputArray)
{
	let new_modal = { elementType: 'div', className: 'modalForm calednarModal', children: [
		{ elementType: 'h3', text: months[inputDate.getMonth()] + ' ' + inputDate.getDate() + ', ' + inputDate.getFullYear() },
		] }

		for(let i = 0; i < textInputArray.length; i++)
		{
			new_modal.children.push({ elementType: 'div', className: '', text: textInputArray[i] })
		}
	createModal('newBujditName', new_modal)
	document.getElementById('createItemName').focus()
}

function yesNoConfirmationModal(itemName, inputQuestion, modalClassName, inputFunction)
{
	let new_modal = { elementType: 'div', className: 'modalForm ' + modalClassName, children: [
		{ elementType: 'h2', className: 'modalHighlight', text: itemName },
		{ elementType: 'h3', text: inputQuestion },
		{ elementType: 'div', style: {flex: '1 1 auto'} },
		{ elementType: 'div', text: 'Yes', className: 'modalButton yesButton', onclick: inputFunction },
		{ elementType: 'div', text: 'No', className: 'modalButton noButton', onclick: closeModal }
		] }
	createModal('deleteBujdit', new_modal)
}

function renderDeleteBujditModal(bujditID, bujditName)
{
	yesNoConfirmationModal(bujditName, 'Are you sure you want to delete this Bujdit?', 'bujditModal', ()=>{renderSecondDeleteBujditModal(bujditID, bujditName)})
}

function renderSecondDeleteBujditModal(bujditID, bujditName)
{
	yesNoConfirmationModal(bujditName, 'Are you ABSOLUTELY SURE you want to delete this Bujdit?', 'bujditModal', ()=>{renderThirdDeleteBujditModal(bujditID, bujditName)})
}

function renderThirdDeleteBujditModal(bujditID, bujditName)
{
	yesNoConfirmationModal(bujditName, 'Are you 100% ABSOLUTELY POSITIVELY SURE? This operation CANNOT be undone!!1', 'bujditModal', ()=>{deleteBujdit(bujditID)})
}
