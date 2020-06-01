let proposals = JSON.parse(decodeURIComponent(window.location.search.replace(/^\?/, '')));
let content = document.getElementById('content');

let preview = templates.remark({
	prop: templates.placeholder({
		entity: proposals.ids[0][0].prop,
	}),
	vals: [templates.code(proposals.ids[0][0].value)],
});

let labelField = templates.join({
  human: proposals.titles[0],
});

content.appendChild(preview);
resolvePlaceholders();

let direction = document.createElement('div');
direction.innerText = '⬇';
direction.style.fontSize = '50vw';
direction.style.textAlign = 'center';
direction.style.color = '#c8ccd1';

content.appendChild(direction);

content.appendChild(labelField);

let saveButton = document.createElement('button');
let form = document.createElement('div');
saveButton.setAttribute('disabled', 'disabled');
saveButton.innerText = '💾';

form.classList.add('submit-actions');

form.appendChild(saveButton);
content.appendChild(form);

let selectedEntity = '';

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type == "attributes") {
      if (labelField.hasAttribute('data-selected-entity')) {
      	saveButton.removeAttribute('disabled');
      	selectedEntity = labelField.getAttribute('data-selected-entity');
      }
    }
  });
});

observer.observe(labelField, {
  attributes: true,
});

saveButton.addEventListener('click', async function() {
	if (selectedEntity && !saveButton.hasAttribute('disabled')) {
		saveButton.setAttribute('disabled', 'disabled');

		let jobs = [];

		if (selectedEntity === 'CREATE') {
			let lang = navigator.language.substr(0,2);;
			jobs.push({
				type: 'create',
				label: labelField.getAttribute('data-selected-label'),
				lang: lang,
				fromTab: proposals.fromTab,
			});
			selectedEntity = 'LAST'; 
		}

		let now = new Date();

		jobs.push({
			type: 'set_claim',
			subject: selectedEntity,
			verb: proposals.ids[0][0].prop,
			object: proposals.ids[0][0].value,
			references: [{
			  "P854": [{
		      "snaktype": "value",
		      "property": "P854",
		      "datavalue": {
		        "value": proposals.source.url,
		        "type": "string"
		      },
		      "datatype": "url"
			  }],
			  "P1476": [{
		      "snaktype": "value",
		      "property": "P1476",
		      "datavalue": {
		        "value": {
		          "text": proposals.source.title,
		          "language": proposals.source.lang ? proposals.source.lang : 'zxx',
		        },
		        "type": "monolingualtext"
		      },
		      "datatype": "string"
			  }],
			  "P813": [{
		      "snaktype": "value",
		      "property": "P813",
		      "datavalue": {
		        "type": "time",
		        "value": {
		          "after": 0,
		          "before": 0,
		          "calendarmodel": "http://www.wikidata.org/entity/Q1985727",
		          "precision": 11,
		          "time": `+${ now.toISOString().substr(0,10) }T00:00:00Z`,
		          "timezone": 0
		        }
		      }
		    }]
			}],
		});

		browser.runtime.sendMessage({
			type: 'send_to_wikidata',
			data: jobs,
		});

		if (selectedEntity.match(/\w\d+/)) {
			window.location = 'entity.html?' + selectedEntity;
		}
	}
});