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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'design') {
            setFormData(prev => ({
                ...prev,
                design: value,
                length: lengthOptions[value][0].value,
                projection: projectionOptions[0].value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const calculatePrice = () => {
        const priceKey = `${formData.design}-${formData.length}-${formData.projection}`;
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
        if(formData.design === 'D1') totalPrice += 1500;
        if(formData.design === 'D2') totalPrice += 2500;
        if(formData.design === 'D3') totalPrice += 3500;
    
        // Add Permit Fee
        if(formData.permitRequired === 'yes') {
            totalPrice += 3500;
        }
    
        // Add Concrete Footing Costs
        const footingPricePerColumn = formData.permitRequired === 'yes' ? 800 : 400;
        const numberOfColumns = parseInt(formData.columns || 0);
        totalPrice += footingPricePerColumn * numberOfColumns;
        
        setResult(`Estimated Price: $${totalPrice.toFixed(2)}`);
    };

    const calculateScreenPrice = () => {
        try {
            if (screenHeight === "10+ Ft ask pricing") {
                setScreenResult("Please contact us for pricing on screens over 10 ft in height");
                return;
            }

            const price = window.screenPrices[screenHeight][screenWidth];
            if (price) {
                setScreenResult("Screen Price: $" + price.toFixed(2) + " (" + screenHeight + " x " + screenWidth + ")");
            } else {
                setScreenResult("Please select valid dimensions for pricing");
            }
        } catch (error) {
            console.error("Error calculating screen price:", error);
            setScreenResult("Error calculating price. Please try again.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">LUX Pergola Calculator</h1>
            
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
                        {formData.design === 'D1' && "$1,500"}
                        {formData.design === 'D2' && "$2,500"}
                        {formData.design === 'D3' && "$3,500"}
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