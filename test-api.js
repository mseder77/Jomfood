/**
 * Quick API Test Script
 * Tests the location-based restaurant sorting API
 * 
 * Usage: node test-api.js
 */

const API_BASE_URL = 'http://localhost:5055/api';

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(testName, url, expectedChecks) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Testing: ${testName}`, 'blue');
    log(`URL: ${url}`, 'yellow');
    log('='.repeat(60), 'cyan');
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            log(`❌ HTTP Error: ${response.status}`, 'red');
            log(JSON.stringify(data, null, 2), 'red');
            return false;
        }
        
        log('✅ Request successful', 'green');
        
        // Run expected checks
        let allChecksPassed = true;
        for (const check of expectedChecks) {
            const result = check.fn(data);
            if (result) {
                log(`  ✅ ${check.name}`, 'green');
            } else {
                log(`  ❌ ${check.name}`, 'red');
                allChecksPassed = false;
            }
        }
        
        // Show sample data
        if (data.data && data.data.length > 0) {
            log('\n📊 Sample Data:', 'cyan');
            const sample = data.data[0];
            log(`  Restaurant: ${sample.business_id?.company_name || 'N/A'}`, 'yellow');
            log(`  Distance: ${sample.distance !== undefined ? sample.distance + ' km' : 'Not provided'}`, 'yellow');
            log(`  Latitude: ${sample.business_id?.lat || 'N/A'}`, 'yellow');
            log(`  Longitude: ${sample.business_id?.lng || 'N/A'}`, 'yellow');
        }
        
        return allChecksPassed;
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

async function runTests() {
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║      Location-Based Restaurant Sorting API Tests          ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    
    const results = [];
    
    // Test 1: Normal request (no location)
    results.push(await testAPI(
        'Normal Request (No Location)',
        `${API_BASE_URL}/jomfood-settings/businesses?page=1&limit=5`,
        [
            {
                name: 'Response has success=true',
                fn: (data) => data.success === true
            },
            {
                name: 'Response has data array',
                fn: (data) => Array.isArray(data.data)
            },
            {
                name: 'Response has pagination',
                fn: (data) => data.pagination !== undefined
            },
            {
                name: 'NO distance property (expected)',
                fn: (data) => data.data.length === 0 || data.data[0].distance === undefined
            }
        ]
    ));
    
    // Test 2: Location-based request
    results.push(await testAPI(
        'Location-Based Request',
        `${API_BASE_URL}/jomfood-settings/businesses?page=1&limit=5&user_lat=3.0738&user_lng=101.5183&sort_by=nearest`,
        [
            {
                name: 'Response has success=true',
                fn: (data) => data.success === true
            },
            {
                name: 'Response has data array',
                fn: (data) => Array.isArray(data.data)
            },
            {
                name: 'Distance property EXISTS',
                fn: (data) => data.data.length > 0 && data.data[0].distance !== undefined
            },
            {
                name: 'Distance is a number',
                fn: (data) => data.data.length > 0 && typeof data.data[0].distance === 'number'
            },
            {
                name: 'Distances are in ascending order (sorted)',
                fn: (data) => {
                    if (data.data.length < 2) return true;
                    for (let i = 1; i < data.data.length; i++) {
                        if (data.data[i].distance < data.data[i-1].distance) {
                            return false;
                        }
                    }
                    return true;
                }
            },
            {
                name: 'Distance is reasonable (< 100 km)',
                fn: (data) => data.data.length === 0 || data.data[0].distance < 100
            }
        ]
    ));
    
    // Test 3: Invalid latitude
    results.push(await testAPI(
        'Invalid Latitude (Should Fail)',
        `${API_BASE_URL}/jomfood-settings/businesses?page=1&limit=5&user_lat=999&user_lng=101.5183&sort_by=nearest`,
        [
            {
                name: 'Response has success=false',
                fn: (data) => data.success === false
            },
            {
                name: 'Error message exists',
                fn: (data) => data.message !== undefined
            }
        ]
    ));
    
    // Test 4: Pagination with location
    results.push(await testAPI(
        'Pagination Page 2 with Location',
        `${API_BASE_URL}/jomfood-settings/businesses?page=2&limit=5&user_lat=3.0738&user_lng=101.5183&sort_by=nearest`,
        [
            {
                name: 'Response has success=true',
                fn: (data) => data.success === true
            },
            {
                name: 'Current page is 2',
                fn: (data) => data.pagination?.currentPage === 2
            },
            {
                name: 'Distance property EXISTS',
                fn: (data) => data.data.length > 0 && data.data[0].distance !== undefined
            }
        ]
    ));
    
    // Summary
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                      TEST SUMMARY                          ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    log(`\n${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
    
    if (passed === total) {
        log('\n🎉 All tests passed! Your API is working correctly!', 'green');
    } else {
        log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
    }
    
    log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// Run the tests
runTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});

