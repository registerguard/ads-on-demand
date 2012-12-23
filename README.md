# Responsive ads, on _demand_!

### Responsive ad serving experiments using [writeCapture2()](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [onMediaQuery()](https://github.com/JoshBarr/js-media-queries) to call [OpenX](http://www.openx.com) ads based on viewport size!

---

**Note:** *Check the [`develop` brach](https://github.com/registerguard/ads-on-demand/tree/develop) for the latest changes to the code ([compare branches here](https://github.com/registerguard/ads-on-demand/branches)).*

---

#### DEMOS

Scan with phone and/or click to view the [latest demo](http://registerguard.github.com/ads-on-demand/demos/advanced/demo1.html):

[![qr code](http://chart.apis.google.com/chart?cht=qr&chl=https://github.com/registerguard/ads-on-demand&chs=240x240)](http://registerguard.github.com/ads-on-demand/demos/advanced/demo1.html)

## Advanced demos

1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/advanced/default.html)** - [OpenX](http://www.openx.com/publisher/enterprise-ad-server) [ad unit group](http://www.openx.com/docs/openx_help_center/content/managingpages.html) implementation: Using [OpenX](http://www.openx.com/docs/openx_help_center/)'s [synchronous javascript](http://www.openx.com/docs/openx_help_center/content/adtagguide_synchjs.html) ad tags, out of the box!
1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/advanced/demo1.html)** - Using [`writeCapture()`](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [`onMediaQuery()`](https://github.com/registerguard/js-media-queries) to call [OpenX](http://www.openx.com/docs/openx_help_center/)'s [`showAdUnit()`](http://www.openx.com/docs/openx_help_center/content/adtagguide_tagapi_instancemethods.html#adtagguide_tagapi_instance_showadunit) based on viewport size!

## Basic demos

1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/basic/default.html)** - [OpenX](http://www.openx.com/publisher/enterprise-ad-server) "ad unit group" implementation: Using [OpenX](http://www.openx.com/docs/openx_help_center/)'s [synchronous javascript](http://www.openx.com/docs/openx_help_center/content/adtagguide_synchjs.html) ad tags, out of the box!
1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/basic/demo1.html)** - Using [`writeCapture()`](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [`onMediaQuery()`](https://github.com/registerguard/js-media-queries) to call [OpenX](http://www.openx.com/docs/openx_help_center/)'s [`requestAd({})`](http://www.openx.com/docs/openx_help_center/content/adtagguide_tagapi_staticmethods.html#adtagguide_tagapi_static_requestad) based on viewport size!
1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/basic/demo2.html)** - Using [`writeCapture()`](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [`onMediaQuery()`](https://github.com/registerguard/js-media-queries) to call [OpenX](http://www.openx.com/docs/openx_help_center/)'s [`showAdUnit()`](http://www.openx.com/docs/openx_help_center/content/adtagguide_tagapi_instancemethods.html#adtagguide_tagapi_instance_showadunit) based on viewport size!
1. **[DEMO](http://registerguard.github.com/ads-on-demand/demos/basic/demo3.html)** - Ad calls in head: Using [`writeCapture()`](https://github.com/iamnoah/writeCapture/tree/writeCapture2) and [`onMediaQuery()`](https://github.com/registerguard/js-media-queries) to call [OpenX](http://www.openx.com/docs/openx_help_center/)'s [`showAdUnit()`](http://www.openx.com/docs/openx_help_center/content/adtagguide_tagapi_instancemethods.html#adtagguide_tagapi_instance_showadunit) based on viewport size!

---

#### DETAILS

At [The Register-Guard](http://www.registerguard.com), we're currently in the process of building a "[responsive](http://en.wikipedia.org/wiki/Responsive_Web_Design)" template for an upcoming redesign of our [site](http://www.registerguard.com).

Serving different ads, and ad sizes, at the various break points is a **mission critical** aspect of our redesign requirements (we even optimized our [grid](https://github.com/registerguard/newsstand) system to work with [Standard Advertising Units](http://www.iab.net/ad_unit) ad sizes). 

Our initial thought was to use CSS `display:none` to show/hide ad positions… Unfortunately, while it might sound easy to impliment such a system, there are drawbacks:

> From a functional perspective, your first instinct might be to use a simple display:none; in your stylesheet to hide bigger ads from showing up after a certain breakpoint. However, it’s not that easy.  
> What happens here is that the ad code is still being loaded, the impressions are counted for the advertiser, but their ad isn’t being shown. Using display:none to hide some ads would result in skewed numbers and would definitely affect the performance of ad campaigns. Display: none; isn’t a solution, it just creates more problems.  
> [Adaptive Web-Design & Advertising](http://blog.buysellads.com/2012/01/adaptive-web-design-advertising/)

##### Doh!
 
We use [OpenX](http://www.openx.com) "[Enterprise](http://openx.com/support/log-in)" to serve ads; after a few quick experiments, we quickly came to realize that OpenX isn't setup to serve ads, on the fly, based on viewport size.

##### Huh?

It all boils down to Javascript's `document.write` command; unfortunately, if you call a script that uses this command (after the page has loaded) it will wipe out your page and only display the output of the command.

If you you're building a responsive website, and you want your ad sizes to change based on viewport size, then trying to call ad tags that use the `document.write` command can be a **big PITA**.

##### What's this then?

This project *attempts* to force OpenX ads into loading "on demand", in a responsive layout.

~~I'm using the scripts (mentioned above) to shove **all** of the ad code in the bottom of the page (faster page loads! Woot!) and load ads, when they're needed, as the viewport size changes.~~

In two of the demos, I have the ad calls at the foot of the document. IMHO, this is optimal because it allows the page to load before the ad scripts even *think* about executing!

---

#### RAMBLINGS

* Why can't OpenX rewrite their scripts so that they work, *out of the box*, in the foot of the page (thus, allowing page content to load without delay)?
* Why can't OpenX just offer some sort of more robust and contemporary JS API? Maybe something that dosen't use *oldschool* `document.writes`?
* Why can't we have the ability to put OpenX's ad calls inside javascript variables so they can be used when needed, on **and** after (the) page loads?

---

#### OBSERVATIONS & IDEAS

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

#### DISCUSSIONS

* writeCapture.js Users: [Using WriteCapture2 to manage loading of ads on a responsive website...](http://rgne.ws/O3kJuU)
* [element.write](https://github.com/iamnoah/element.write), issue #2: [Unexpected call to method or property access](https://github.com/iamnoah/element.write/issues/2)

---

#### BROWSER SUPPORT

#### Browsers tested with (Mac/PC):

Here's the basic test suite:

* Desktop:
    * Firefox
    * Safari
    * Opera
    * Chrome
    * IE 6-9
* iPhone:
    * Safari
    * Chrome
    * Opera Mini
* iPad:
    * Safari

Check out the [demo pages](https://github.com/registerguard/ads-on-demand#demos) for more details.

#### DEBUG TOOLS

* [Virtual PC](http://www.microsoft.com/windows/virtual-pc/download.aspx)  
**Note:** I'd suggest clicking the "Don't need XP Mode and want VPC only? Download Windows Virtual PC without Windows XP Mode." link... XP Mode sounds like a headache. Always disable automatic updates so that the current version of IE doesn't get upgraded automatically.
    * [IE tester images](http://www.microsoft.com/en-us/download/details.aspx?id=11575).
    * [Installing Multiple Virtual PCs (XP Mode accepted)](http://ie.microsoft.com/testdrive/ieblog/2011/Feb/04_TestingMultipleVersionsofIEonOnePC_2.htm).
* [Adobe Flash DEBUG Player](http://www.adobe.com/support/flashplayer/downloads.html)
    * **Note:** Don't make the same mistake I did... Install Flash player on the VPC IE apps!
* Mac:
    * [Firebug](https://getfirebug.com/)
* PC:
    * [DebugBar](http://www.debugbar.com/): Free! Or paid... I've only used the free version.
        * [Companion.JS](http://www.my-debugbar.com/wiki/CompanionJS/HomePage): An awesome JS debugger for IE!
    * [Internet Explorer Developer Toolbar](http://www.microsoft.com/en-us/download/details.aspx?id=18359)
        * Small tip: When you have the IE Toolbar open, notice the menu item labled "Browser Mode"; switching modes can be helpful to catch JS errors.
    * [View Generated Source in IE6](http://wendt.se/blog/2011/07/25/view-generated-source-in-ie6/): A decent Bookmarklet for IE6.
    * [Fiddler](http://www.fiddler2.com/fiddler2/): Fiddler is a Web Debugging Proxy which logs all HTTP(S) traffic between your computer and the Internet.
    * [Firebug Lite](https://getfirebug.com/firebuglite/): Like Firebug for Firefox, but lighter. :)
    * Don't forget to turn on [script debugging](http://blogs.msdn.com/b/ie/archive/2004/10/26/247912.aspx) via the VPC IE apps!

#### LINKS & RESOURCES

* [OpenX Enterprise documentation](http://www.openx.com/docs/openx_help_center/)
* [Responsive Advertising: A Ranged Solution](http://artequalswork.com/posts/responsive-ads.php)
* [matchMedia() polyfill](https://github.com/paulirish/matchMedia.js/)
* [Responsive Web Design and JavaScript](http://seesparkbox.com/foundry/responsive_web_design_and_javascript)
* [Harvey - CSS media query state management](http://harvesthq.github.com/harvey/)
* [The state of responsive advertising: the publishers' perspective](http://www.netmagazine.com/features/state-responsive-advertising-publishers-perspective)
* [Adaptive Web-Design & Advertising](http://blog.buysellads.com/2012/01/adaptive-web-design-advertising/)
* [`WriteCapture2`](https://github.com/iamnoah/writeCapture/tree/writeCapture2)
* [`element.write`](https://github.com/iamnoah/element.write)
* [`onMediaQuery`](https://github.com/JoshBarr/js-media-queries), and here's [my fork](https://github.com/registerguard/js-media-queries)

#### CODE EXAMPLE

OpenX test code; staging a section for use in the real world.

## Section Front

#### Desktop

```js
var OX = OX();
OX.addVariable('section', 'sports');
OX.addPage('13289');
OX.fetchAds();
```

###### Billboard | 970 x 90

```js
OX.showAdUnit('273993');
```

###### Leaderboard | 728 x 90

```js
OX.showAdUnit('273978');
```

###### Medium Rectangle 1 | 300 x 250

```js
OX.showAdUnit('273979');
```

###### Medium Rectangle 2 | 300 x 250

```js
OX.showAdUnit('273980');
```

#### Tablet

```js
var OX = OX();
OX.addVariable('section', 'sports');
OX.addPage('13291');
OX.fetchAds();
```

###### Billboard | 640 x 100

```js
OX.showAdUnit('273976');
```

###### Leaderboard | 320 x 50

```js
OX.showAdUnit('273977');
```

###### Medium Rectangle 1 | 300 x 250

```js
OX.showAdUnit('280965');
```

###### Medium Rectangle 2 | 300 x 250

```js
OX.showAdUnit('280967');
```

#### Mobile

```js
var OX = OX();
OX.addVariable('section', 'Sports');
OX.addPage('13292');
OX.fetchAds();
```

###### Billboard | 320 x 50

```js
OX.showAdUnit('273975');
```

###### Leaderboard | 320 x 50

```js
OX.showAdUnit('280964');
```

###### Medium Rectangle 1 | 300 x 250

```js
OX.showAdUnit('280966');
```

###### Medium Rectangle 2 | 300 x 250

```js
OX.showAdUnit('280968');
```

## Story Page

#### Desktop

```js
var OX = OX();
OX.addVariable('section', 'Sports');
OX.addPage('13308');
OX.fetchAds();
```

###### Leaderboard | 728 x 90

```js
OX.showAdUnit('273984');
```

###### Medium Rectangle | 300 x 250

```js
OX.showAdUnit('273986');
```

#### Tablet

```js
var OX = OX();
OX.addVariable('section', 'Sports');
OX.addPage('13310');
OX.fetchAds();
```

###### Leaderboard | 320 x 50

```js
OX.showAdUnit('273983');
```

###### Medium Rectangle | 300 x 250

```js
OX.showAdUnit('283019');
```

#### Mobile

```js
var OX = OX();
OX.addVariable('section', 'Sports');
OX.addPage('13309');
OX.fetchAds();
```

###### Leaderboard | 320 x 50

```js
OX.showAdUnit('283016');
```

###### Medium Rectangle | 300 x 250

```js
OX.showAdUnit('283022');
```

---

*Developed by [Micky Hulse](http://hulse.me)/[The Register-Guard](http://www.registerguard.com).*