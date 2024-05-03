$(window).bind("load", function () {
    var rpc_nodes = [
        "https://api.deathwing.me",
        "https://hive.roelandp.nl",
        "https://api.openhive.network",
        "https://rpc.ausbit.dev",
        "https://hived.emre.sh",
        "https://hive-api.arcange.eu",
        "https://api.hive.blog",
        "https://api.c0ff33a.uk",
        "https://rpc.ecency.com",
        "https://anyx.io",
        "https://techcoderx.com",
        "https://api.hive.blue",
        "https://rpc.mahdiyari.info"
    ];

    var he_rpc_nodes = [
        "https://engine.rishipanthee.com", 
        "https://ha.herpc.dtools.dev", 
        "https://api.hive-engine.com",
        "https://api.primersion.com",
        "https://herpc.actifit.io"
    ];

    let ssc;
    
    // Function to populate the dropdown box with RPC nodes
    async function populateHiveApiDropdown() {
        const dropdown = document.getElementById("rpc-nodes-dropdown");

        rpc_nodes.forEach(node => {
            const option = document.createElement("option");
            option.value = node;
            option.text = node;
            dropdown.appendChild(option);
        });

        // Read the selected endpoint from localStorage
        const selectedHiveEndpoint = localStorage.getItem("selectedHiveEndpoint");

        if (selectedHiveEndpoint) {
            // Set the selected option in the dropdown
            dropdown.value = selectedHiveEndpoint;
        }
    };

    // Function to populate the dropdown box with RPC nodes
    async function populateHEApiDropdown() {
        const dropdown = document.getElementById("herpc-nodes-dropdown");

        he_rpc_nodes.forEach(node => {
            const option = document.createElement("option");
            option.value = node;
            option.text = node;
            dropdown.appendChild(option);
        });

        // Read the selected endpoint from localStorage
        const selectedEngineEndpoint = localStorage.getItem("selectedEngineEndpoint");

        if (selectedEngineEndpoint) {
            // Set the selected option in the dropdown
            dropdown.value = selectedEngineEndpoint;
        }
    };

    // Populate the dropdown box with RPC nodes
    populateHiveApiDropdown();
    populateHEApiDropdown();

    initializeHiveAPI();
    initializeEngineAPI(); 

    hive.config.set('alternative_api_endpoints', rpc_nodes);

    function dec(val) {
        return Math.floor(val * 1000) / 1000;
    };

    const swapAccounts = ["uswap", "bswap", "cropswap", "hiveswap"];
    const swapURLs = {
        "uswap": "https://uswap.app",
        "bswap": "https://bswap.cc",
        "cropswap": "https://www.dcrops.com/swap",
        "hiveswap": "https://beeswap.dcity.io/convert"
    };

    const processSwapsLiq = async () => {
        try 
        {
            const allBalances = await Promise.all(swapAccounts.map(account => getBalances(account)));
            console.log("All Balances: ", allBalances);

            if (allBalances.length > 0) 
            {
                $("#swapcard").removeClass("d-none");
                $("#swapcard").addClass("d-flex");
                let tbLiquidity = $("#liqBalances");
                tbLiquidity.html("");
                allBalances.forEach((bridge, index) => {
                    let tr = $("<tr></tr>");
                    tr.append(`<td>${bridge.ACCOUNT}</td>`);
                    tr.append(`<td>${bridge.HIVE}</td>`);
                    tr.append(`<td>${bridge["SWAP.HIVE"]}</td>`);
                    const accountURL = getUrl(bridge.ACCOUNT);
                    if (accountURL) 
                    {
                        tr.append(`<td><a class="link-info" href="${accountURL}" target="_blank">Visit</a></td>`);
                    }
                    tbLiquidity.append(tr);
                });
            }
        } 
        catch (error)
        {
            console.log("Error at processSwapsLiq() : ", error);
        }
    };

    async function getBalances(account) 
    {
        try 
        {
            const res = await hive.api.getAccountsAsync([account]);
            if (res.length > 0) {
                const res2 = await ssc.find("tokens", "balances", { account, symbol: { "$in": ["SWAP.HIVE"] } }, 1000, 0, []);
                var swaphive = res2.find(el => el.symbol === "SWAP.HIVE");
                return {
                    ACCOUNT: account,
                    HIVE: dec(parseFloat(res[0].balance.split(" ")[0])),
                    "SWAP.HIVE": dec(parseFloat((swaphive) ? swaphive.balance : 0))
                };
            } 
            else 
            {
                return { ACCOUNT: account, HIVE: 0, "SWAP.HIVE": 0 };
            }
        } 
        catch (error) 
        {
            console.log("Error at getBalances() : ", error);
            return { ACCOUNT: account, HIVE: 0, "SWAP.HIVE": 0 };
        }
    };

    function getUrl(account) 
    {
        return swapURLs[account];
    };

    $(document).ready(function () {
        $(".refreshBridges").on("click", function () {
            processSwapsLiq(); // Call the processSwapsLiq() function when the button is clicked
        });
    });

    processSwapsLiq();

    selectHiveNode();
    selectEngineNode();

    async function selectHiveNode() {
        try {
            document.getElementById("rpc-nodes-dropdown").addEventListener("change", function () {
                const selectedRpcNode = this.value;
                hive.api.setOptions({ url: selectedRpcNode });
                console.log("selectedRpcNode : ", selectedRpcNode);
                // Reload the page with the selected RPC node
                localStorage.setItem("selectedHiveEndpoint", selectedRpcNode);
                // Reload the page after 1 second (adjust the time as needed)
                setTimeout(function () {
                    location.reload();
                }, 1000);
            });
        } 
        catch (error) 
        {
            console.log("Error at selectHiveNode() : ", error);
        }
    };

    async function selectEngineNode() {
        try {
            document.getElementById("herpc-nodes-dropdown").addEventListener("change", function () {
                const selectedRpcNode = this.value;
                hive.api.setOptions({ url: selectedRpcNode });
                console.log("selectedRpcNode : ", selectedRpcNode);
                // Reload the page with the selected RPC node
                localStorage.setItem("selectedEngineEndpoint", selectedRpcNode);
                // Reload the page after 1 second (adjust the time as needed)
                setTimeout(function () {
                    location.reload();
                }, 1000);
            });
        } 
        catch (error) 
        {
            console.log("Error at selectEngineNode() : ", error);
        }
    };    

    async function getSelectedHiveEndpoint() {
        var endpoint = await localStorage.getItem("selectedHiveEndpoint");
        if (endpoint) 
        {
          return endpoint;
        } 
        else 
        {
          return "https://anyx.io";
        }
    };

    async function getSelectedEngineEndpoint() {
        var endpoint = await localStorage.getItem("selectedEngineEndpoint");
        if (endpoint) 
        {
          return endpoint;
        } 
        else 
        {
          return "https://engine.rishipanthee.com";
        }
    };

    async function initializeHiveAPI() {
        var selectedHiveEndpoint = await getSelectedHiveEndpoint();
        console.log("SELECT HIVE API NODE : ", selectedHiveEndpoint);
        hive.api.setOptions({ url: selectedHiveEndpoint });

        var dropdownbox = document.getElementById("rpc-nodes-dropdown").value;
        dropdownbox.value = selectedHiveEndpoint;
        dropdownbox.innerHTML = selectedHiveEndpoint;
    };

    async function initializeEngineAPI() {
        var selectedEngineEndpoint = await getSelectedEngineEndpoint();
        console.log("SELECT ENGINE API NODE : ", selectedEngineEndpoint);
        ssc = new SSC(selectedEngineEndpoint);

        var dropdownbox = document.getElementById("herpc-nodes-dropdown").value;
        dropdownbox.value = selectedEngineEndpoint;
        dropdownbox.innerHTML = selectedEngineEndpoint;
    };
    
     // Set up a setInterval to call processSwapsLiq() every 3 minutes (3 minutes * 60 seconds)
    setInterval(function () {
        processSwapsLiq();
    }, 3 * 60 * 1000); // 3 minutes * 60 seconds * 1000 milliseconds
});