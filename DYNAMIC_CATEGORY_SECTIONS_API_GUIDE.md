# Dynamic Category Sections API Integration Guide

## Overview
This guide explains how to implement the dynamic category sections feature that displays deals grouped by deal categories in carousel sliders. Each section shows deals for a specific deal category, with support for global filtering.

## Feature Description
- Multiple carousel sections, one for each active deal category
- Each section displays up to 10 deals in a horizontal carousel
- Global filters apply to all category sections (search, sort, deal type, tags, price range, discount range, restaurant category)
- Location-based sorting support (lat/lng)
- Responsive carousel with navigation buttons

---

## API Endpoints

### 1. Get Active Deal Categories
**Endpoint:** `GET /api/jomfood-deal-categories/active`

**Description:** Retrieves all active deal categories to display as sections.

**Query Parameters:**
- `show_category` (optional): Filter by show_category field (`true`/`false`). If not provided, returns all active categories.

**Example Requests:**
```
GET /api/jomfood-deal-categories/active
GET /api/jomfood-deal-categories/active?show_category=true
GET /api/jomfood-deal-categories/active?show_category=false
```

**Response Format:**
```json
{
  "success": true,
  "message": "Active deal categories retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Limited Time Offers",
      "image_url": "https://example.com/images/limited-time.jpg",
      "sort_order": 1,
      "show_category": true,
      "is_active": true
    },
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "name": "Best Deals",
      "image_url": "https://example.com/images/best-deals.jpg",
      "sort_order": 2,
      "show_category": true,
      "is_active": true
    }
  ]
}
```

---

### 2. Get Active Deals (with Deal Category Filter)
**Endpoint:** `GET /api/jomfood-deals/active`

**Description:** Retrieves active deals filtered by deal category and other global filters.

**Query Parameters:**
- `deal_category_id` (required): The ID of the deal category to filter by
- `limit` (optional): Number of deals to return (default: 10 for carousel)
- `lat` (optional): User's latitude for location-based sorting
- `lng` (optional): User's longitude for location-based sorting
- `sort_by` (optional): Sort order (`newest`, `oldest`, `price_low`, `price_high`, `discount_high`, `discount_low`, `recommended`, `nearest`)
- `deal_type` (optional): Filter by deal type
- `tags` (optional): Comma-separated list of tags
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `min_discount` (optional): Minimum discount percentage
- `max_discount` (optional): Maximum discount percentage
- `category_id` (optional): Restaurant category ID (from "Browse by Cuisine" filter)
- `text_search` (optional): Search by deal name, tags, or restaurant name

**Example Request:**
```
GET /api/jomfood-deals/active?deal_category_id=64a1b2c3d4e5f6789012345&limit=10&sort_by=newest&lat=3.1390&lng=101.6869
```

**Response Format:**
```json
{
  "success": true,
  "message": "Active deals retrieved successfully",
  "data": {
    "deals": [
      {
        "_id": "deal123",
        "deal_name": "50% Off Chinese Buffet",
        "deal_image": "https://example.com/deal1.jpg",
        "restaurant": {
          "_id": "rest123",
          "name": "Golden Dragon Restaurant",
          "category_id": "cat123"
        },
        "deal_items": [
          {
            "product_name": "Buffet Lunch",
            "product_image": "https://example.com/product1.jpg",
            "original_price": 50.00,
            "discounted_price": 25.00
          }
        ],
        "deal_category_id": "64a1b2c3d4e5f6789012345",
        "tags": ["buffet", "chinese"],
        "valid_from": "2024-01-01T00:00:00Z",
        "valid_until": "2024-12-31T23:59:59Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

**Alternative Response Format (if backend returns array directly):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "deal123",
      "deal_name": "50% Off Chinese Buffet",
      ...
    }
  ]
}
```

---

## Implementation Flow

### Step 1: Fetch Deal Categories
1. On page/screen load, call `GET /api/jomfood-deal-categories/active?show_category=true`
2. Store the list of deal categories
3. Sort by `sort_order` if available

### Step 2: Create Category Sections
For each deal category:
1. Create a section with the category name as the title
2. Initialize a carousel/horizontal scroll view
3. Show loading state

### Step 3: Fetch Deals for Each Category
For each deal category section:
1. Call `GET /api/jomfood-deals/active` with:
   - `deal_category_id`: The category's `_id`
   - `limit`: 10 (or desired number)
   - Include all global filter parameters (if any filters are active)
   - Include `lat` and `lng` if user location is available
2. Display deals in the carousel
3. Handle empty states (no deals found)

### Step 4: Apply Global Filters
When any global filter changes (search, sort, price range, etc.):
1. Update the global filter state
2. Re-fetch deals for ALL category sections with the new filters
3. Update each carousel with filtered results

---

## Global Filters Integration

### Filter Parameters
When applying global filters, include these query parameters in each category section's API call:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `text_search` | string | Search by deal name, tags, or restaurant name | `"chinese"` |
| `sort_by` | string | Sort order | `"newest"`, `"price_low"`, `"recommended"` |
| `deal_type` | string | Filter by deal type | `"discount"`, `"bogo"` |
| `tags` | string | Comma-separated tags | `"buffet,chinese"` |
| `min_price` | number | Minimum price | `10.00` |
| `max_price` | number | Maximum price | `100.00` |
| `min_discount` | number | Minimum discount % | `10` |
| `max_discount` | number | Maximum discount % | `50` |
| `category_id` | string | Restaurant category ID | `"cat123"` |
| `lat` | number | User latitude | `3.1390` |
| `lng` | number | User longitude | `101.6869` |

### Example: Filtered Request
```
GET /api/jomfood-deals/active?deal_category_id=64a1b2c3d4e5f6789012345&limit=10&sort_by=price_low&category_id=cat123&min_price=10&max_price=50&lat=3.1390&lng=101.6869
```

---

## Android Implementation Example

### 1. Data Models

```kotlin
// DealCategory.kt
data class DealCategory(
    val _id: String,
    val name: String,
    val image_url: String?,
    val sort_order: Int,
    val show_category: Boolean,
    val is_active: Boolean
)

// Deal.kt
data class Deal(
    val _id: String,
    val deal_name: String,
    val deal_image: String?,
    val deal_category_id: String,
    val restaurant: Restaurant?,
    val deal_items: List<DealItem>,
    val tags: List<String>,
    val valid_from: String,
    val valid_until: String
)

// GlobalFilters.kt
data class GlobalFilters(
    val textSearch: String? = null,
    val sortBy: String? = null,
    val dealType: String? = null,
    val tags: List<String>? = null,
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val minDiscount: Int? = null,
    val maxDiscount: Int? = null,
    val categoryId: String? = null,
    val lat: Double? = null,
    val lng: Double? = null
)
```

### 2. API Service

```kotlin
// ApiService.kt
interface ApiService {
    @GET("jomfood-deal-categories/active")
    suspend fun getActiveDealCategories(
        @Query("show_category") showCategory: Boolean? = null
    ): Response<DealCategoriesResponse>
    
    @GET("jomfood-deals/active")
    suspend fun getActiveDeals(
        @Query("deal_category_id") dealCategoryId: String,
        @Query("limit") limit: Int = 10,
        @Query("sort_by") sortBy: String? = null,
        @Query("deal_type") dealType: String? = null,
        @Query("tags") tags: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("min_discount") minDiscount: Int? = null,
        @Query("max_discount") maxDiscount: Int? = null,
        @Query("category_id") categoryId: String? = null,
        @Query("text_search") textSearch: String? = null,
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null
    ): Response<DealsResponse>
}
```

### 3. Repository

```kotlin
// CategoryDealsRepository.kt
class CategoryDealsRepository(private val apiService: ApiService) {
    
    suspend fun getDealCategories(showCategory: Boolean? = true): Result<List<DealCategory>> {
        return try {
            val response = apiService.getActiveDealCategories(showCategory)
            if (response.isSuccessful && response.body()?.success == true) {
                val categories = response.body()?.data ?: emptyList()
                Result.success(categories.sortedBy { it.sort_order })
            } else {
                Result.failure(Exception("Failed to fetch categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getDealsForCategory(
        dealCategoryId: String,
        filters: GlobalFilters,
        limit: Int = 10
    ): Result<List<Deal>> {
        return try {
            val response = apiService.getActiveDeals(
                dealCategoryId = dealCategoryId,
                limit = limit,
                sortBy = filters.sortBy,
                dealType = filters.dealType,
                tags = filters.tags?.joinToString(","),
                minPrice = filters.minPrice,
                maxPrice = filters.maxPrice,
                minDiscount = filters.minDiscount,
                maxDiscount = filters.maxDiscount,
                categoryId = filters.categoryId,
                textSearch = filters.textSearch,
                lat = filters.lat,
                lng = filters.lng
            )
            
            if (response.isSuccessful) {
                val deals = when {
                    response.body()?.data?.deals != null -> response.body()!!.data.deals
                    response.body()?.data is List<*> -> response.body()!!.data as List<Deal>
                    else -> emptyList()
                }
                Result.success(deals)
            } else {
                Result.failure(Exception("Failed to fetch deals"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 4. ViewModel

```kotlin
// CategoryDealsViewModel.kt
class CategoryDealsViewModel(
    private val repository: CategoryDealsRepository
) : ViewModel() {
    
    private val _dealCategories = MutableStateFlow<List<DealCategory>>(emptyList())
    val dealCategories: StateFlow<List<DealCategory>> = _dealCategories.asStateFlow()
    
    private val _globalFilters = MutableStateFlow(GlobalFilters())
    val globalFilters: StateFlow<GlobalFilters> = _globalFilters.asStateFlow()
    
    private val _categoryDeals = MutableStateFlow<Map<String, List<Deal>>>(emptyMap())
    val categoryDeals: StateFlow<Map<String, List<Deal>>> = _categoryDeals.asStateFlow()
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()
    
    init {
        loadDealCategories()
    }
    
    fun loadDealCategories() {
        viewModelScope.launch {
            _loading.value = true
            repository.getDealCategories(showCategory = true)
                .onSuccess { categories ->
                    _dealCategories.value = categories
                    // Load deals for each category
                    categories.forEach { category ->
                        loadDealsForCategory(category._id)
                    }
                }
                .onFailure { error ->
                    // Handle error
                    Log.e("CategoryDeals", "Error loading categories", error)
                }
            _loading.value = false
        }
    }
    
    fun loadDealsForCategory(dealCategoryId: String) {
        viewModelScope.launch {
            repository.getDealsForCategory(dealCategoryId, _globalFilters.value)
                .onSuccess { deals ->
                    _categoryDeals.value = _categoryDeals.value.toMutableMap().apply {
                        put(dealCategoryId, deals)
                    }
                }
                .onFailure { error ->
                    Log.e("CategoryDeals", "Error loading deals for category", error)
                }
        }
    }
    
    fun updateGlobalFilters(filters: GlobalFilters) {
        _globalFilters.value = filters
        // Reload all category sections with new filters
        _dealCategories.value.forEach { category ->
            loadDealsForCategory(category._id)
        }
    }
}
```

### 5. UI Component (RecyclerView with Horizontal Scroll)

```kotlin
// CategoryDealsAdapter.kt
class CategoryDealsAdapter(
    private val deals: List<Deal>,
    private val onDealClick: (Deal) -> Unit
) : RecyclerView.Adapter<DealViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DealViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_deal_card, parent, false)
        return DealViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: DealViewHolder, position: Int) {
        holder.bind(deals[position], onDealClick)
    }
    
    override fun getItemCount() = deals.size
}

// CategorySectionAdapter.kt (for vertical list of category sections)
class CategorySectionAdapter(
    private val categories: List<DealCategory>,
    private val categoryDeals: Map<String, List<Deal>>,
    private val onDealClick: (Deal) -> Unit
) : RecyclerView.Adapter<CategorySectionViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategorySectionViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category_section, parent, false)
        return CategorySectionViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: CategorySectionViewHolder, position: Int) {
        val category = categories[position]
        val deals = categoryDeals[category._id] ?: emptyList()
        holder.bind(category, deals, onDealClick)
    }
    
    override fun getItemCount() = categories.size
}
```

---

## Key Points for Android Developer

1. **Two API Calls Required:**
   - First: Get all deal categories → Create sections
   - Second: For each category, get deals → Populate carousel

2. **Global Filters:**
   - Store filters in a shared state (ViewModel/Repository)
   - When filters change, re-fetch deals for ALL categories
   - Include all filter parameters in each category's API call

3. **Location Support:**
   - Request location permissions
   - Pass `lat` and `lng` to API for location-based sorting
   - Update when user location changes

4. **Empty States:**
   - Handle cases where a category has no deals
   - Show appropriate message or hide the section

5. **Loading States:**
   - Show loading indicators while fetching
   - Handle errors gracefully

6. **Performance:**
   - Consider caching deal categories (they change infrequently)
   - Implement pagination if showing more than 10 deals per category
   - Use RecyclerView for efficient rendering

---

## Testing Checklist

- [ ] All active deal categories are displayed as sections
- [ ] Each section shows up to 10 deals in a carousel
- [ ] Global filters apply to all category sections
- [ ] Location-based sorting works when lat/lng provided
- [ ] Empty states handled correctly
- [ ] Loading states displayed appropriately
- [ ] Error handling implemented
- [ ] Carousel navigation works smoothly
- [ ] Deal cards display correctly with images, prices, etc.

---

## Support
For questions or issues, refer to the main API documentation or contact the backend team.