$(document).ready(function () {

    var browserNotSupported = false;

    //Array to Store Streaming Tweet Locations
    var words = ["Twitter App", "Aplicação para buscar twittes e streams",];

    //Array to Store Streaming HashTags
    var hashTagsArr = ["Twitter"];

    var hashTagsAndProfile = [];

    var height = $(window).height(), width = $("#chart").width();

    try {
        var streamLocation = new EventSource('/tweetLocation');

        streamLocation.addEventListener('streamLocation', function (event) {

            var location = event.data;

            if (location !== "") {
                words.push(location);
            }
            ;

        });

        streamLocation.addEventListener('streamHashtags', function (event) {

            var hashtags = event.data;
            //console.log(hashtags);
            if (hashtags !== '' && hashtags !== '""') {
                hashTagsArr.push(hashtags);
            }
            ;

        });
    }
    catch (err) {
        words = ["Olá Twitters"];
        browserNotSupported = true;
    }

    $("#hashTags").height(height).width($("#text-container").width());

    var lastClassindex = 0;
    showNewHashTags();

    function showNewHashTags() {

        //Put Project Info in beetween hashtags
        if (Math.floor(Math.random() * 20) === 10) {
            var dispInfo = [];
            hashTagsArr = hashTagsArr.concat(dispInfo);
        }

        for (var i = 0; i < hashTagsArr.length; i++) {

            $("#hashTags").append("<tr class='" + returnTextClass(lastClassindex) + "'><td><b><p class=' text-" + returnTextClass(lastClassindex + 2) + "'> "
                + hashTagsArr[i] + "</p></b></p></td></tr>");
            lastClassindex++;

        }
        $('#hashTags').animate({scrollTop: $('#hashTags').prop("scrollHeight")}, 2000);
        lastClassindex = hashTagsArr.length;

        hashTagsArr = []; //Empty hashTag Array to free up array

        setTimeout(function () {
            showNewHashTags();
        }, 2000);

    }

    function returnTextClass(index) {
        var cssClass = ["success", "info", "warning", "danger", "primary"];
        var ind = index % 5;
        return cssClass[ind];
    }


    //..........Code for Word Cloud............

    //Store Compressed Data
    var compressedWordArray = compressArray(words);

    // Encapsulate the word cloud functionality
    function wordCloud(selector) {

        var fill = d3.scale.category20();

        //Construct the word cloud's SVG element
        var svg = d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        //Draw the word cloud
        function draw(words) {
            var cloud = svg.selectAll("g text")
                .data(words, function (d) {
                    return d.text;
                });

            //Entering words
            cloud.enter()
                .append("text")
                .style("font-family", "Impact")
                .style("fill", function (d, i) {
                    return fill(i);
                })
                .attr("text-anchor", "middle")
                .attr('font-size', 1)
                .text(function (d) {
                    return d.text;
                });

            //Entering and existing words
            cloud
                .transition()
                .duration(600)
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("fill-opacity", 1);

            //Exiting words
            cloud.exit()
                .transition()
                .duration(200)
                .style('fill-opacity', 1e-6)
                .attr('font-size', 1)
                .remove();
        }

        function returnRotation() {
            var angle = [0, -90, -60, -45, -30, 0, 30, 45, 60, 90];
            var index = Math.floor(Math.random() * 10);
            return angle[index];
        }

        //Use the module pattern to encapsulate the visualisation code. We'll
        // expose only the parts that need to be public.
        return {

            //Recompute the word cloud for a new set of words. This method will
            // asycnhronously call draw when the layout has been computed.
            //The outside world will need to call this function, so make it part
            // of the wordCloud return value.
            update: function (words) {

                var maxSize = d3.max(compressedWordArray, function (d) {
                    return d.size;
                });
                //Define Pixel of Text
                var pixScale = d3.scale.linear()
                    .domain([0, maxSize])
                    .range([10, 80]);

                d3.layout.cloud().size([(width - 50), (height - 20)])
                    .words(words)
                    .padding(5)
                    .rotate(function () {
                        return ~~(Math.random() * 2) * returnRotation();
                    })
                    .font("Impact")
                    .fontSize(function (d) {
                        return Math.floor(pixScale(d.size));
                    })
                    .on("end", draw)
                    .start();
            }
        };

    }

    //This method tells the word cloud to redraw with a new set of words.
    //In reality the new words would probably come from a server request,
    // user input or some other source.
    function showNewWords(vis) {

        if (browserNotSupported) {
            words = [];
        } else if (words.length === 0) {
            words = ["Parece que", "Ninguém", "Tweetou", "Nos últimos cinco segundos",];
        }

        compressedWordArray = compressArray(words);

        vis.update(compressedWordArray);
        words = []; //Empty Word Array to free up array

        setTimeout(function () {
            showNewWords(vis);
        }, 5000);

    }

    //Create a new instance of the word cloud visualisation.
    var myWordCloud = wordCloud('body');

    //Start cycling through the demo data
    showNewWords(myWordCloud);

    function compressArray(original) {

        var compressed = [];
        // make a copy of the input array
        var copy = original.slice(0);

        // first loop goes over every element
        for (var i = 0; i < original.length; i++) {

            var myCount = 0;
            // loop over every element in the copy and see if it's the same
            for (var w = 0; w < copy.length; w++) {
                if (original[i] === copy[w]) {
                    // increase amount of times duplicate is found
                    myCount++;
                    // sets item to undefined
                    delete copy[w];
                }
            }

            if (myCount > 0) {
                var a = new Object();
                a.text = original[i];
                a.size = myCount;
                compressed.push(a);
            }
        }

        return compressed;
    };
});