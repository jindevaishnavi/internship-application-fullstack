
addEventListener('fetch', event => {
	  event.respondWith(handleRequest(event.request))
	})
	
	/**
	 * Handles  elements
	*/
	class ElementHandler {
	  element(element) {
	     if(element.tagName == 'title') {
      element.setInnerContent('Cloudflare HomeTask Variant');
    } else if(element.tagName == 'h1') {
      element.setInnerContent(`Vaishnavi's Helpline Variants `);
    } else if(element.tagName == 'p') {
      element.setInnerContent(`This variant guides you to vaishnavi's personal blog`);
    } else if(element.tagName == 'a') {
      element.setInnerContent('Go to Vaishnavi\'s personal website...');
      element.setAttribute('href', 'https://vaishnavijinde.wordpress.com');
    }
	  }
	}
  let ind;
   const elementHandler = new ElementHandler();
	const htmlRewriter = new HTMLRewriter().on('title', elementHandler)
        .on('h1#title', elementHandler)
        .on('p#description', elementHandler)
        .on('a#url', elementHandler);
	
	/**
	 * Response with random variant page content.
	 * @param {Request} request
	*/
	async function handleRequest(request) {
	  const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
	  const responseJson = await response.json();
    console.log(responseJson);
	  const variant = responseJson['variants'];
	  ind = Math.floor(Math.random() * 2);
	  const variantResponse = await fetch(variant[ind]);
	  return htmlRewriter.transform(variantResponse);
	}
async function handleRequest(request) {
  let urlReq = new Request('https://cfw-takehome.developers.workers.dev/api/variants');

 /**Fetch the url variants */
  const urlRes = await fetch(urlReq).then(function(res) {
    if(res.status == 200) {
      return res.json();
    } else {
      throw new Error(`${res.status}`);
    }
  }).then(function(json) {
    return json.variants;
  })

  var d = new Date();
  var index = null;
  let cookie = request.headers.get('Cookie');
  var isResponseAvailable = false;
  /**Cookie to retain the variant for a user */
    if(cookie) {
    let cookies = cookie.split(';');
    cookies.forEach(cookie => {
      let cVal = cookie.split('=');
      if(cVal[0].trim() == 'variant') {
        isResponseAvailable = true;
        index = parseInt(cVal[1]);
      }
    })
  }
  if(index == null) {
    /**Random selection of variant */
    index = d.getMilliseconds() % urlRes.length;
  }

  let varReq = new Request(urlRes[index]);
/*

HTMLRewriter API to customize the elements
*/ 
  const varRes = await fetch(varReq).then(function(res) {
    if(res.status == 200) {
      const elementHandler = new ElementHandler();
      return new HTMLRewriter().on('title', elementHandler)
        .on('h1#title', elementHandler)
        .on('p#description', elementHandler)
        .on('a#url', elementHandler)
        .transform(res);
    } else {
      throw new Error(`${res.status}`);
    }
  }).then(function(pageText) {
    return pageText.text();
  })

  var response = new Response(varRes, {
    headers: { 
      'content-type': 'text/html',
     },
  });

  if(!isResponseAvailable) {
    response.headers.append('Set-Cookie', 'variant=' + index + '; SameSite=None; Secure');
  }

  return response;
}
