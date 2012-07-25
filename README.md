# Ads on _Demand_!

Using [writeCapture2()](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [onMediaQuery()](https://github.com/JoshBarr/js-media-queries) to call [OpenX](http://www.openx.com) ads based on viewport size!

---

##### Demos:

Here:

[Using writeCapture() and onMediaQuery() to call OpenX's requestAd({}) based on viewport size!](http://registerguard.github.com/ads-on-demand/ads-on-demand/demo1.html)

... here:

[Using writeCapture() and onMediaQuery() to call OpenX's showAdUnit() based on viewport size!](http://registerguard.github.com/ads-on-demand/ads-on-demand/demo2.html)

... and finally, here:

[Ad calls in head: Using writeCapture() and onMediaQuery() to call OpenX's showAdUnit() based on viewport size!](http://registerguard.github.com/ads-on-demand/ads-on-demand/demo3.html)

**Note: Each page has a list of browsers that this code has been (quickly) tested in.

---

##### Warning:

This conglomeration of code is just a proof of concept and has not been tested on a production server... **Use at your own risk!**

---

At [The Register-Guard](http://www.registerguard.com), we're currently in the process of building a "[responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design)" template for an upcoming redesign of our [site](http://www.registerguard.com).

Serving different ads, and ad sizes, at the various break points is a **mission critical** aspect of our redesign requirements (we even optimized our [grid](https://github.com/registerguard/newsstand) system to work with [Standard Advertising Units](http://www.iab.net/ad_unit) ad sizes). 

Our initial thought was to use CSS `display:none` to show/hide ad positions… Unfortunately, while it might sound easy to impliment such a system, there are drawbacks:

> From a functional perspective, your first instinct might be to use a simple display:none; in your stylesheet to hide bigger ads from showing up after a certain breakpoint. However, it’s not that easy.  
> What happens here is that the ad code is still being loaded, the impressions are counted for the advertiser, but their ad isn’t being shown. Using display:none to hide some ads would result in skewed numbers and would definitely affect the performance of ad campaigns. Display: none; isn’t a solution, it just creates more problems.  
> [Adaptive Web-Design & Advertising](http://blog.buysellads.com/2012/01/adaptive-web-design-advertising/)

### Doh!
 
We use [OpenX](http://www.openx.com) "[Enterprise](http://openx.com/support/log-in)" to serve ads; after a few quick experiments, we quickly came to realize that OpenX isn't setup to serve ads, on the fly, based on viewport size.

### Huh?

It all boils down to Javascript's `document.write` command; unfortunately, if you call a script that uses this command (after the page has loaded) it will wipe out your page and only display the output of the command.

If you you're building a responsive website, and you want your ad sizes to change based on viewport size, then trying to call ad tags that use the `document.write` command can be a **big PITA**.

### What's this then?

This *attempts* to force OpenX ads into loading, on demand, in a responsive layout.

<s>I'm using the scripts (mentioned above) to shove **all** of the ad code in the bottom of the page (faster page loads! Woot!) and load ads, when they're needed, as the viewport size changes.</s>

In two of the demos, I have the ad calls at the foot of the document. IMHO, this is optimal because it allows the page to load before any of the ad scripts even think about executing...

### "Why cant's":

* Why can't OpenX rewrite their scripts so that they work, *out of the box*, in the foot of the page (thus, allowing page content to load without delay)?
* Why can't OpenX just offer some sort of more robust and contemporary JS API? Maybe something that dosen't use *oldschool* `document.writes`?

---

### Other stuff:

I'm sleepy, so here's a bunch of random notes from the past couple of days:

##### Observations:

1. OpenX uses `document.write;` this JavaScript technique only works on page load. If one tries to swap ad positions after page load (using JavaScript), the the whole page gets wiped in place of new ad code.
1. Using CSS to show/hide ad positions is not a solution: Ad impressions for hidden ads are still counted.
1. OpenX does not provide ANY alternatives to document.write (it might be nice if they offerd a `JSONP` script).
1. [OpenX Enterprise docs](http://www.openx.com/docs/openx_help_center/content/gettingstarted.html) are skimpy and there's not many people out there sharing code that relate to this version. In other words, it appears as though OpenX has yet to think about solutions for responsive sites (we are basically at the mercy of the limited options provided to us) and there's a lot of uncharted territory out there in terms of OpenX wheel inventing (and responsive ads in general). 
1. OpenX has used document.write for a long time now, so I suspect they're not going to change anytime soon (I hope I'm wrong here).
1. In reality, in most cases, only the geeks change viewport size. 
1. <blockquote>Boston Globe solved this problem on their famously responsive site by creating a designated advertising column. That column is set to a fixed width large enough to contain the ad, and the ad is never resized, even as the rest of the page adjusts responsively. It's not ideal, but it keeps the ad intact.<br>[Handling Adsense banners in a responsive layout](http://stackoverflow.com/a/9433920/922323)</blockquote>
1. Looks like there are other companies out there trying to solve this problem: [BuySellAds](http://buysellads.com/publishers/pro) and [ResponsiveAds](http://responsiveads.com/).

##### Ideas:

1. iPhone doesn't load Flash, so fallback images are our best bet. Maybe it might be easier to show/hide image positions for every other view than the initially loaded one?
1. Maybe hide positions that don't fit when viewport changes?
1. Rethink ad stack: sell more units that will work on all devices?
1. Work with OpenX peeps?
1. Override `document.write`? Unfortunately, there's a lot of these calls in different scripts. Overriding that built-in JS method is a hack. 
1. Most of the above solutions require a shit ton of code. We need a simple and easy to change/manage solution'
1. Propose a solution to OpenX? Fix their code for them?
1. Using PHP or Django, grab the `JSON` "mobile" feed, convert it to `JSONP`, cache it, and use the cached version to show/hide ads on pages? 

---

**That's all folks!**
