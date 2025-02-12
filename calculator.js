function PergolaCalculator() {
    // Screen calculator state
    const [screenResult, setScreenResult] = React.useState('');
    const [screenHeight, setScreenHeight] = React.useState('6 ft 7 inch');
    const [screenWidth, setScreenWidth] = React.useState('4 ft 11 inch');
 
    // Pergola calculator state
    const [formData, setFormData] = React.useState({
        design: 'D1',
        length: '8.2',
        projection: '8.2',
        height: 'standard',
        color: 'RAL7016',
        mounting: 'freestanding',
        ledPerimeter: 'no',
        heaters: 0,
        fans: 0,
        permitRequired: 'no',
        columns: 4
    });
    
    const [result, setResult] = React.useState('');
    const [pergolaPrice, setPergolaPrice] = React.useState(null);
    const [screenPrice, setScreenPrice] = React.useState(null);
    const [totalPricePerSqFt, setTotalPricePerSqFt] = React.useState(null);
    const [totalSquareFeet, setTotalSquareFeet] = React.useState(null);
 
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const pergolaData = {
            ...formData,
            price: pergolaPrice
        };
        
        const screenData = screenPrice ? {
            height: screenHeight,
            width: screenWidth,
            linearFeet: document.getElementById("linearFeet").value,
            screenCount: document.getElementById("screenCount").value,
            price: screenPrice,
            pricePerSqFt: totalPricePerSqFt,
            totalSqFt: totalSquareFeet,
            totalLinearFeet: document.getElementById("linearFeet").value
        } : {
            height: "No screen selected",
            width: "N/A",
            linearFeet: "N/A",
            screenCount: "N/A",
            price: "0.00"
        };
 
        const totalProjectCost = (parseFloat(pergolaData.price) + parseFloat(screenData.price)).toFixed(2);
        
        ReactDOM.render(
            <PrintableOrder 
                pergolaData={pergolaData} 
                screenData={screenData}
                totalProjectCost={totalProjectCost}
            />, 
            printWindow.document.body
        );
        printWindow.document.head.innerHTML = document.head.innerHTML;
        printWindow.print();
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'design') {
            // Set initial values based on design type
            let initialLength, initialProjection;
            
            if (value === 'D2') {
                initialLength = "19.67";  // First valid length for D2
                initialProjection = "22.11";  // First valid projection for D2
            } else {
                initialLength = lengthOptions[value][0].value;
                initialProjection = projectionOptions[0].value;
            }
            
            
            setFormData(prev => ({
                ...prev,
                design: value,
                length: initialLength,
                projection: initialProjection
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const getProjectionOptions = () => {
        if (formData.design === 'D2') {
            return projectionOptions.filter(option => 
                ['22.11', '21.4', '19.8', '18.0', '16.42', '14.8', '13.1', '11.5', '9.84', '8.2'].includes(option.value)
            );
        }
        return projectionOptions;
    };
    
    
    const calculatePrice = () => {
        let priceKey;

         // 🔍 Debugging: Check if formData has correct values before generating key
    console.log("🔎 Debugging formData before price calculation:");
    console.log("Design:", formData.design);
    console.log("Length:", formData.length);
    console.log("Projection:", formData.projection);

        if (formData.design === 'D2') {
            // For D2, we need to format the key with the correct decimal places
            const length = formData.length; // This will be from D2_projectionOptions
            const projection = formData.projection;
            priceKey = `${formData.design}-${length}-${projection}`;
        } else {
            // For D1 and D3, keep the existing format
            priceKey = `${formData.design}-${formData.length}-${formData.projection}`;
        }
        
        console.log("Trying to calculate price for:", priceKey);
        let totalPrice = priceChart[priceKey];
        
        if (!totalPrice) {
            setResult('Price not found for selected combination. Please verify measurements.');
            return;
        }
    
        // Mounting Adjustment
        if(formData.mounting === 'wall') {
            const posts = formData.design === 'D3' ? 8 : 4;
            totalPrice -= 140 * posts;
            totalPrice += 8 * posts;
        }
    
        // LED Perimeter
        if(formData.ledPerimeter === 'yes') {
            let perimeter = (parseFloat(formData.length) + parseFloat(formData.projection)) * 2;
            totalPrice += perimeter * 4.27;
        }
    
        // Electric Heater
        totalPrice += parseInt(formData.heaters || 0) * 165;
    
        // Fan Beam
        totalPrice += parseInt(formData.fans || 0) * 209;
    
        // Add Installation Fee
        if(formData.design === 'D1') totalPrice += 0;
        if(formData.design === 'D2') totalPrice += 0;
        if(formData.design === 'D3') totalPrice += 0;
    
        // Add Permit Fee
        if(formData.permitRequired === 'yes') {
            totalPrice += 3500;
        }
    
        // Add Concrete Footing Costs
        const footingPricePerColumn = formData.permitRequired === 'yes' ? 800 : 400;
        const numberOfColumns = parseInt(formData.columns || 0);
        totalPrice += footingPricePerColumn * numberOfColumns;
        
        setResult(`Estimated Price: $${totalPrice.toFixed(2)}`);
        setPergolaPrice(totalPrice.toFixed(2));
    };

    const calculateScreenPrice = () => {
        try {
            if (screenHeight === "10+ Ft ask pricing") {
                setScreenResult("Please contact us for pricing on screens over 10 ft in height");
                return;
            }
    
            const basePrice = window.screenPrices && window.screenPrices[screenHeight] && window.screenPrices[screenHeight][screenWidth];
    
            if (!basePrice) {
                setScreenResult("Please select valid dimensions for pricing");
                return;
            }
    
            // Convert dimensions
            const heightFeet = parseFloat(screenHeight.split(" ")[0]);
            const widthFeet = parseFloat(screenWidth.split(" ")[0]);
    
            if (isNaN(heightFeet) || isNaN(widthFeet)) {
                setScreenResult("Invalid screen dimensions");
                return;
            }
    
            // 1️⃣ Calculate total square footage
            const totalSqFt = heightFeet * widthFeet;
            setTotalSquareFeet(totalSqFt);
    
            // 2️⃣ Calculate base cost per sq ft
            const baseCostPerSqFt = basePrice / totalSqFt;
    
            // 3️⃣ Adjust cost per sq ft with 2.75 multiplier
            const officialPricePerSqFt = baseCostPerSqFt * 2.75;
            setTotalPricePerSqFt(officialPricePerSqFt.toFixed(2));
    
            // 4️⃣ Compute total price before linear feet
            const totalPriceBeforeLinearFeet = officialPricePerSqFt * totalSqFt;
    
            // 5️⃣ Compute price per linear foot
            const finalPricePerLinearFoot = totalPriceBeforeLinearFeet / widthFeet;
    
            // Get user's linear feet selection and calculate final price
            const linearFeet = parseFloat(document.getElementById("linearFeet").value) || 0;
            const finalPrice = finalPricePerLinearFoot * linearFeet;
            
            setScreenPrice(finalPrice.toFixed(2));
            setScreenResult(`Total Screen Price: $${finalPrice.toFixed(2)}`);
            
        } catch (error) {
            console.error("Error calculating screen price:", error);
            setScreenResult("Error calculating price. Please try again.");
        }
    };   
    return (
        <div className="max-w-4xl mx-auto p-6">
           <h1 className="text-2xl font-bold mb-6">LUX PRICES</h1>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow">
                <div className="mb-4">
                    <label className="block mb-2">Design Selection:</label>
                    <select
                        name="design"
                        value={formData.design}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="D1">D1: With 4 Posts</option>
                        <option value="D2">D2: With 4 Posts with Middle Beam & Gutter</option>
                        <option value="D3">D3: With 8 Post Two pieces Connect together</option>
                    </select>

                    <div className="mt-4">
                        {formData.design === 'D1' && (
                            <img src="d1-image.jpg" alt="D1 Design" className="w-full max-w-lg mx-auto rounded-lg shadow-lg border-2" />
                        )}
                        {formData.design === 'D2' && (
                            <img src="d2-image.jpg" alt="D2 Design" className="w-full max-w-lg mx-auto rounded-lg shadow-lg border-2" />
                        )}
                        {formData.design === 'D3' && (
                            <div className="mt-4">
                                <div className="flex gap-4 justify-center">
                                    <div className="w-1/2">
                                        <img src="d3-image.jpg" alt="D3 Design" className="w-full rounded-lg shadow-lg border-2" />
                                    </div>
                                    <div className="w-1/2 flex flex-col gap-4">
                                        <img src="max-width-7m.jpg" alt="Max Width 7M" className="w-full rounded-lg shadow-lg border-2" />
                                        <img src="max-lxw-bay.jpg" alt="Max LxW bay" className="w-full rounded-lg shadow-lg border-2" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Length:</label>
                    <select
                        name="length"
                        value={formData.length}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        {lengthOptions[formData.design].map(option => (
                            <option key={option.value} value={option.value}>
                                {option.text}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
    <label className="block mb-2">Projection:</label>
    <select
        name="projection"
        value={formData.projection}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
    >
        {projectionOptions.map(option => (
            <option key={option.value} value={option.value}>
                {option.text}
            </option>
        ))}
    </select>
</div>

                <div className="mb-4">
                    <label className="block mb-2">Height:</label>
                    <select
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="standard">Standard</option>
                        <option value="custom">Custom (Requires Approval)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Color:</label>
                    <select
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="RAL7016">RAL7016 Artic Dark Grey</option>
                        <option value="RAL9016">RAL 9016 Traffic White</option>
                        <option value="custom">Custom Color call office/pricing</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Mounting Type:</label>
                    <select
                        name="mounting"
                        value={formData.mounting}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="freestanding">Freestanding</option>
                        <option value="wall">Wall Mounted</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">LED Perimeter:</label>
                    <select
                        name="ledPerimeter"
                        value={formData.ledPerimeter}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Electric Heaters:</label>
                    <input
                        type="number"
                        name="heaters"
                        value={formData.heaters}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Fan Beams:</label>
                    <input
                        type="number"
                        name="fans"
                        value={formData.fans}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Installation Fee:</label>
                    <div className="p-2 border rounded bg-gray-50">
                        {formData.design === 'D1' && "$0"}
                        {formData.design === 'D2' && "$0"}
                        {formData.design === 'D3' && "$0"}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Permit Requirements:</label>
                    <select
                        name="permitRequired"
                        value={formData.permitRequired}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="no">No - Standard Installation ($400/column)</option>
                        <option value="yes">Yes - Permit Required ($800/column)</option>
                    </select>
                    <div className="mt-2 p-2 border rounded bg-gray-50">
                        {formData.permitRequired === 'yes'
                            ? "Permit & Engineering Fee: $3,500"
                            : "Permit & Engineering Fee: $0.00"}
                    </div>

                    {formData.permitRequired && (
                        <div className="mt-4">
                            <label className="block mb-2">Number of Columns:</label>
                            <select
                                name="columns"
                                value={formData.columns}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            >
                                {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>
                                        {num} Column{num > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button
                    onClick={calculatePrice}
                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 mb-4"
                >
                    Calculate Pergola Price
                </button>

                {/* Pergola Price Result */}
                {result && (
                    <div className="mt-4 mb-8">
                        <div className="p-4 bg-white rounded border">
                            {result}
                        </div>
                    </div>
                )}

{result && (
    <div className="mt-4 mb-8">
        <div className="p-4 bg-white rounded border">
            {result}
        </div>
        <button
            onClick={handlePrint}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Print Order
        </button>
    </div>
)}

                {/* Motorized Screen Section */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
                    <h2 className="text-xl font-bold mb-4">Motorized Screen Calculator</h2>
                    
                    <div className="mb-4">
                        <label className="block mb-2">Screen Height:</label>
                        <select
                            value={screenHeight}
                            onChange={(e) => setScreenHeight(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="6 ft 7 inch">6 ft 7 inch</option>
                            <option value="8 ft 2 inch">8 ft 2 inch</option>
                            <option value="9 ft 10 inch">9 ft 10 inch</option>
                            <option value="10+ Ft ask pricing">10+ Ft (Call for Pricing)</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Screen Width:</label>
                        <select
                            value={screenWidth}
                            onChange={(e) => setScreenWidth(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="4 ft 11 inch">4 ft 11 inch</option>
                            <option value="6 ft 7 inch">6 ft 7 inch</option>
                            <option value="8 ft 2 inch">8 ft 2 inch</option>
                            <option value="9 ft 10 inch">9 ft 10 inch</option>
                            <option value="11 ft 5 inch">11 ft 5 inch</option>
                            <option value="13 ft 1 inch">13 ft 1 inch</option>
                            <option value="14 ft 9 inch">14 ft 9 inch</option>
                            <option value="16 ft 4 inch">16 ft 4 inch</option>
                            <option value="19 ft 8 inch">19 ft 8 inch</option>
                        </select>
                    </div>
                    <div className="mb-4">
    <label className="block mb-2">Enter Linear Feet:</label>
    <input
        type="number"
        id="linearFeet"
        className="w-full p-2 border rounded"
        placeholder="Enter Linear Feet"
    />
</div>

<div className="mb-4">
    <label className="block mb-2">Number of Screens:</label>
    <input
        type="number"
        id="screenCount"
        className="w-full p-2 border rounded"
        placeholder="Number of Screens"
    />
</div>

                    <button
                        onClick={calculateScreenPrice}
                        className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 mb-4"
                    >
                        Calculate Screen Price
                    </button>

                    {screenResult && (
                        <div>
                            <div className="p-3 bg-white rounded border mb-4">
                                {screenResult}
                            </div>
                            <div className="mt-4 flex justify-center">
                                <img 
                                    src="./motorized-screen.jpg" 
                                    alt="Motorized Screen" 
                                    className="max-w-md rounded-lg shadow-lg border-2" 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<PergolaCalculator />, document.getElementById('root'));
const PrintableOrder = ({ pergolaData, screenData }) => (
  <div className="max-w-3xl mx-auto p-8 bg-white">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4">LUX Order</h1>
      <p className="mb-2">Date: {new Date().toLocaleDateString()}</p>
      <p>Order Reference: SO-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
    </div>

    <div className="border rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Pergola Configuration</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>Model:</div>
        <div>{pergolaData.design}</div>
        <div>Length:</div>
        <div>{pergolaData.length.replace('-', ' ')} ft inch</div>
        <div>Projection:</div>
        <div>{pergolaData.projection.replace('-', ' ')} ft inch</div>
        <div>Height:</div>
        <div>Standard Height: 2.7 M max height</div>
        <div>Color:</div>
        <div>{pergolaData.color === 'RAL7016' ? 'RAL7016 Arctic Dark Grey' : pergolaData.color}</div>
        <div>Mounting Type:</div>
        <div>{pergolaData.mounting === 'freestanding' ? 'Freestanding' : 'Wall Mounted'}</div>
        <div>LED Lights:</div>
        <div>{pergolaData.ledPerimeter === 'yes' ? 'Yes' : 'No'}</div>
        <div>Electric Heaters:</div>
        <div>{pergolaData.heaters}</div>
        <div>Fan Beams:</div>
        <div>{pergolaData.fans}</div>
        <div>Permit Required:</div>
        <div>{pergolaData.permitRequired === 'yes' ? 'Yes' : 'No'}</div>
        <div>Concrete Footers:</div>
        <div>{pergolaData.columns}</div>
      </div>
      <div className="mt-6 text-right text-xl text-green-600 font-bold">
        Estimated Price: ${pergolaData.price}
      </div>
    </div>

    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Motorized Screen Configuration</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>Screen Height:</div>
        <div>{screenData.height}</div>
        <div>Screen Width:</div>
        <div>{screenData.width}</div>
        <div>Linear Feet:</div>
        <div>{screenData.linearFeet}</div>
        <div>Number of Screens:</div>
        <div>{screenData.screenCount}</div>
      </div>
      {screenData.height !== "No screen selected" && (
        <div className="mt-6 text-green-600">
          <div>Price per Square Foot: ${screenData.pricePerSqFt}</div>
          <div>Total Square Feet: {screenData.totalSqFt}</div>
          <div>Total Linear Feet: {screenData.linearFeet}</div>
          <div className="font-bold">Total Price: ${screenData.price}</div>
        </div>
      )}
      {screenData.height === "No screen selected" && (
        <div className="mt-6 text-right text-xl text-green-600 font-bold">
          Screen Price: $0.00
        </div>
      )}
    </div>

    <div className="mt-6 p-4 bg-green-50 rounded">
      <div className="text-xl text-green-600 font-bold text-center">
        Total Project Cost: ${(parseFloat(pergolaData.price) + parseFloat(screenData.price)).toFixed(2)}
      </div>
    </div>

    <div className="mt-8 text-sm text-gray-600">
      This is a computer-generated document. For questions or support, please contact your local LUX representative.
    </div>
  </div>
);