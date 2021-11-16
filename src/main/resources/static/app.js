$(document).ready(function () {

    var browserNotSupported = false;

    // Matriz para armazenar locais de streaming
    var words = ["Twitter App", "Aplicação para buscar twittes e streams",];

    // Matriz para armazenar HashTags de streaming
    var hashTagsArr = ["Twitter"];

    var hashTagsAndProfile = [];
    var height = $(window).height(), width = $("#chart").width();


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

        // Coloque as informações do projeto entre as hashtags
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

        hashTagsArr = []; //  matriz hashTag vazia para liberar o array

        setTimeout(function () {
            showNewHashTags();
        }, 2000);
    }

    function returnTextClass(index) {
        var cssClass = ["success", "info", "warning", "danger", "primary"];
        var ind = index % 5;
        return cssClass[ind];
    }
    //Código para Word Cloud.
    // Armazenar dados compactados
    var compressedWordArray = compressArray(words);

    // Encapsular a funcionalidade da nuvem de palavras
    function wordCloud(selector) {

        var fill = d3.scale.category20();

        // Constrói o elemento SVG da nuvem de palavras
        var svg = d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

        // Desenhe a nuvem de palavras
        function draw(words) {
            var cloud = svg.selectAll("g text")
                .data(words, function (d) {
                    return d.text;
                });

            // Inserindo palavras
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

            // Inserindo palavras e palavras existentes
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

            //palavras existentes
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

        // Use o padrão de módulo para encapsular o código de visualização. Exporemos apenas as partes que precisam ser públicas.
        
        return {

            // Recompute a nuvem de palavras para um novo conjunto de palavras. Este método irá chamar de forma assíncrona quando o layout for calculado. O mundo externo precisará chamar essa função, portanto, inclua-a no valor de retorno do wordCloud.
            
            update: function (words) {

                var maxSize = d3.max(compressedWordArray, function (d) {
                    return d.size;
                });
               // Definir Pixel do Texto
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

    // Este método diz à nuvem de palavras para redesenhar com um novo conjunto de palavras. Na realidade, as novas palavras provavelmente viriam de uma solicitação do servidor, entrada do usuário ou alguma outra fonte.
    function showNewWords(vis) {

        if (browserNotSupported) {
            words = [];
        } else if (words.length === 0) {
            words = ["Parece que", "Ninguém", "Tweetou", "Nos últimos cinco segundos",];
        }

        compressedWordArray = compressArray(words);

        vis.update(compressedWordArray);
        words = []; // Array vazia para apagar words

        setTimeout(function () {
            showNewWords(vis);
        }, 5000);

    }

    // Crie uma nova instância da visualização da nuvem de palavras.
    var myWordCloud = wordCloud('body');

    // Comece a percorrer os dados de demonstração
    showNewWords(myWordCloud);

    function compressArray(original) {

        var compressed = [];
       // faz uma cópia do array de entrada
        var copy = original.slice(0);

        // o primeiro loop passa por todos os elementos
        for (var i = 0; i < original.length; i++) {

            var myCount = 0;
            // faz um loop sobre cada elemento na cópia e veja se é o mesmo
            for (var w = 0; w < copy.length; w++) {
                if (original[i] === copy[w]) {
                    // aumenta a quantidade de vezes que uma duplicata é encontrada
                    myCount++;
                    // define o item como indefinido
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