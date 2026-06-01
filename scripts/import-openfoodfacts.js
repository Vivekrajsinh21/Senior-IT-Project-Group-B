require("dotenv").config(); 
const axios = require("axios"); 
const API = "http://localhost:3004/api/foods"; 
const TOKEN = process.env.SPARKY_TOKEN; 
async function fetchFoods(page = 1) { 
    try { 
        const response = await axios.get( "https://world.openfoodfacts.org/cgi/search.pl", 
            { 
                params: { 
                    search_terms: process.env.SEARCH || "chicken", 
                    json: true, 
                    page: page, 
                    page_size: Number(process.env.LIMIT || 10), 
                }, 
                headers: { 
                    "User-Agent": "Mozilla/5.0", 
                }, timeout: 15000, 
            } 
        ); 
        return response.data.products || []; 
    } catch (error) { 
        console.log("ERROR FETCHING OPENFOODFACTS"); 
        console.log(error.response?.status); 
        return []; 
    } 
} 
function num(v) { 
    return Number(v) || 0; 
} 
function mapFood(f) { 
    return { 
        name: f.product_name || "Unknown Food", 
        brand: f.brands || "", 
        barcode: f.code || "", 
        provider_external_id: f.code || "", 
        provider_type: "openfoodfacts", 
        shared_with_public: true, 
        is_custom: false, 
        is_quick_food: false, 
        serving_size: 100, 
        serving_unit: "g", 
        calories: num( 
            f.nutriments?.["energy-kcal_100g"] ), 
            protein: num( f.nutriments?.proteins_100g ), 
            carbs: num( f.nutriments?.carbohydrates_100g ), 
            fat: num( f.nutriments?.fat_100g ), 
            saturated_fat: num( f.nutriments?.["saturated-fat_100g"] ), 
            sugars: num( f.nutriments?.sugars_100g ), 
            sodium: num( f.nutriments?.sodium_100g ), 
        }; 
    } 
    async function insertFood(food) { 
        try { 
            const response = await axios.post( 
                API, 
                food, 
                { 
                    headers: { 
                        Cookie: `sparky.session_token=${TOKEN}`, 
                    }, 
                } ); 
                console.log(`✓ ${response.data.name}`); 
            } catch (error) { 
                console.log(`✗ ${food.name}`); 
                console.log( 
                    error.response?.data || error.message ); 
                } 
            } 
            async function run() { 
                const foods = await fetchFoods(); 
                console.log(`Found ${foods.length} foods`); 
                for (const food of foods) { 
                    if (!food.product_name) { 
                        continue; 
                    } 
                    const mappedFood = mapFood(food); 
                    await insertFood(mappedFood); 
                    // delay กัน rate limit 
                    await new Promise((resolve) => 
                        setTimeout(resolve, 1000) 
                ); 
            } 
            console.log("DONE"); 
        } 
        run();