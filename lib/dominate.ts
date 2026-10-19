/*@preserve DOMinate by Adrian Sieber*/
// https://github.com/ad-si/DOMinate

DOMinate = function (array, //Array containing the DOM fragment in JsonML
                  namespace, //Namespace
                  returnObject) { //Contains elements identified by their id

	var doc = window.document,
		i,
		b;

	//Set on first iteration
	returnObject = returnObject || {}

	//Set default namespace to XHTML namespace
	namespace = namespace || 'http://www.w3.org/1999/xhtml'

	//Create DOM element from syntax sugar string
	function createElement(sugarString) {

		var element = doc.createElementNS(namespace, sugarString.match(/^\w+/)[0]), //Create element
			id,
			ref,
			classNames

		//Assign id if is set
		if (id = sugarString.match(/#([\w-]+)/)) {

			element.id = id[1]

			//Add element to the return object
			returnObject[id[1]] = element
		}

		//Create reference to the element and add it to the return object
		if (ref = sugarString.match(/\$([\w-]+)/))
			returnObject[ref[1]] = element


		//Assign class if is set
		if (classNames = sugarString.match(/\.[\w-]+/g))
			element.setAttribute('class', classNames.join(' ').replace(/\./g, ''))

		//Return DOM element
		return element
	}

	//If is string create DOM element else is already a DOM element
	if (array[0].big)
		array[0] = createElement(array[0])

	//For each in the element array (except the first)
	for (i = 1; i < array.length; i++) {

		//If is string has to be content so set it
		if (array[i].big)
			array[0].appendChild(doc.createTextNode(array[i]));

		//If is array has to be child element
		else if (array[i].pop) {

			//If is string create DOM element else is already a DOM element
			if (array[i][0].big)
				array[i][0] = createElement(array[i][0])

			//Append the element to its parent element
			array[0].appendChild(array[i][0])

			//Use DOMinate recursively for all child elements
			DOMinate(array[i], namespace, returnObject)
		}

		//If is function call with current element as first argument
		else if (array[i].call)
			array[i](array[0])

		//Else must be object with attributes
		else
		//For each attribute
			for (b in array[i]) {
			  if (b == 'html') array[0].innerHTML = array[i][b];
			  else if (b == 'onClick') $(array[0]).onClick(array[i][b]);
			  else array[0].setAttribute(b, array[i][b]);
      }
	}

	//Return root element on index 0
	returnObject[0] = array[0]

	//returns object containing all elements with an id and the root element
	return returnObject
}