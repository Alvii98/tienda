function initializeMenu() {
    if (!window.matchMedia('(max-width: 800px)').matches) return

    const menuToggle = document.querySelector('.menu-toggle')
    const navigation = document.querySelector('#main-navigation')
    const backdrop = document.querySelector('.menu-backdrop')
    const closeButton = document.querySelector('.menu-close')

    if (!menuToggle || !navigation || !backdrop) return

    function closeMenu() {
        navigation.classList.remove('is-open')
        backdrop.classList.remove('is-visible')
        menuToggle.setAttribute('aria-expanded', 'false')
        menuToggle.setAttribute('aria-label', 'Abrir menú')
        document.body.classList.remove('menu-open')
        navigation.style.pointerEvents = 'none'
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = navigation.classList.toggle('is-open')
        backdrop.classList.toggle('is-visible', isOpen)
        menuToggle.setAttribute('aria-expanded', String(isOpen))
        menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú')
        document.body.classList.toggle('menu-open', isOpen)
        navigation.style.pointerEvents = isOpen ? 'auto' : 'none'
    })
    backdrop.addEventListener('click', closeMenu)
    if (closeButton) closeButton.addEventListener('click', closeMenu)
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu))
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu()
    })
}

function initializeCart() {
    const cartButton = document.querySelector('.cart-btn')
    const cartPanel = document.querySelector('#tienda_carrito')
    const cartOverlay = document.querySelector('.cart-overlay')
    const cartCloseButtons = document.querySelectorAll('[data-cart-close]')

    if (!cartButton || !cartPanel || !cartOverlay) return

    function closeCart() {
        cartPanel.classList.remove('is-visible')
        cartPanel.setAttribute('aria-hidden', 'true')
        cartOverlay.classList.remove('is-visible')
        cartButton.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('cart-open')

        const url = new URL(window.location.href)
        if (url.searchParams.has('carrito')) {
            url.searchParams.delete('carrito')
            window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
        }
    }

    function openCart() {
        cartPanel.classList.add('is-visible')
        cartPanel.setAttribute('aria-hidden', 'false')
        cartOverlay.classList.add('is-visible')
        cartButton.setAttribute('aria-expanded', 'true')
        document.body.classList.add('cart-open')
    }

    window.abrirCarrito = openCart

    cartButton.addEventListener('click', () => {
        const isOpen = cartPanel.classList.contains('is-visible')
        if (isOpen) {
            closeCart()
            return
        }
        openCart()
    })

    cartCloseButtons.forEach((button) => button.addEventListener('click', closeCart))

    cartOverlay.addEventListener('click', closeCart)

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && cartPanel.classList.contains('is-visible')) closeCart()
    })
}

function initializeProductModal() {
    const productContainer = document.querySelector('#product-grid, #product-table-body')
    const modal = document.querySelector('#product-modal')
    const modalImage = document.querySelector('#product-modal-image')
    const modalTitle = document.querySelector('#product-modal-title')
    const modalDescription = document.querySelector('#product-modal-description')
    const modalPrice = document.querySelector('#product-modal-price')
    const closeButton = document.querySelector('[data-product-modal-close]')
    const addButton = document.querySelector('#product-modal-add')
    const shareButton = document.querySelector('#product-modal-share')
    const previousButton = document.querySelector('.product-modal-arrow-prev')
    const nextButton = document.querySelector('.product-modal-arrow-next')

    if (!productContainer || !modal || !modalImage || !modalTitle || !modalDescription || !modalPrice || !closeButton || !addButton || !shareButton || !previousButton || !nextButton) return

    let selectedProductId = ''
    let productImages = []
    let currentImageIndex = 0

    function updateModalImage() {
        if (!productImages.length) return
        modalImage.src = `/tienda/${productImages[currentImageIndex]}`
        previousButton.hidden = productImages.length < 2
        nextButton.hidden = productImages.length < 2
    }

    function closeModal() {
        modal.classList.remove('is-visible')
        modal.setAttribute('aria-hidden', 'true')
        document.body.classList.remove('product-modal-open')

        const url = new URL(window.location.href)
        if (url.searchParams.has('id')) {
            url.searchParams.delete('id')
            window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
        }
    }

    function openModal(card) {
        const image = card.querySelector('.product-photo img, .product-thumb')
        const title = card.querySelector('.product-info h3, strong')
        const description = card.querySelector('.product-info p, small')
        const price = card.querySelector('.product-info .price, td:nth-child(2)')

        if (!image || !title || !description || !price) return

        modalImage.src = image.src
        modalImage.alt = image.alt
        modalTitle.textContent = title.textContent
        modalDescription.textContent = description.textContent
        modalPrice.textContent = price.textContent
        selectedProductId = card.dataset.productId || ''
        productImages = [image.getAttribute('src').replace('/tienda/', '')]
        currentImageIndex = 0
        updateModalImage()
        modal.classList.add('is-visible')
        modal.setAttribute('aria-hidden', 'false')
        document.body.classList.add('product-modal-open')
        closeButton.focus()

        const datosPost = new FormData()
        datosPost.append('imagenesProducto', true)
        datosPost.append('id', selectedProductId)
        fetch('/tienda/ajax/datos_productos.php', { method: 'POST', body: datosPost })
            .then(response => response.json())
            .then(json => {
                if (json.error || !json.resp.length) return
                productImages = json.resp.map(item => item.imagen_ruta)
                currentImageIndex = 0
                updateModalImage()
            })
            .catch(error => console.error('Error al cargar imágenes:', error))
    }

    window.abrirModalProductoPorId = (id) => {
        const product = Array.from(productContainer.querySelectorAll('[data-product-id]'))
            .find((item) => String(item.dataset.productId) === String(id))
        if (product) openModal(product)
    }

    productContainer.addEventListener('click', (event) => {
        const productImage = event.target.closest('.product-photo img, .product-thumb')
        if (!productImage) return
        openModal(event.target.closest('.product-card, tr'))
    })
    closeButton.addEventListener('click', closeModal)
    previousButton.addEventListener('click', () => {
        if (productImages.length < 2) return
        currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length
        updateModalImage()
    })
    nextButton.addEventListener('click', () => {
        if (productImages.length < 2) return
        currentImageIndex = (currentImageIndex + 1) % productImages.length
        updateModalImage()
    })
    addButton.addEventListener('click', () => {
        if (!selectedProductId) return
        cargarCarrito(selectedProductId)
        closeModal()
    })
    shareButton.addEventListener('click', () => {
        compartirProducto(selectedProductId, modalTitle.textContent, modalPrice.textContent)
    })
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal()
    })
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-visible')) closeModal()
    })
}

function initializeStore() {
    const filterButtons = document.querySelectorAll('.filter-btn')
    const productCards = document.querySelectorAll('.product-card')
    const searchInput = document.querySelector('#search')
    const cartCount = document.querySelector('.cart-count')
    const toast = document.querySelector('#toast')
    let selectedFilter = 'todos'
    let cartItems = 0

    if (!searchInput) return

    function updateProducts() {
        const query = searchInput.value.toLowerCase().trim()
        let visibleProducts = 0
        productCards.forEach((card) => {
            const matchesFilter = selectedFilter === 'todos' || card.dataset.category.includes(selectedFilter)
            const matchesSearch = card.dataset.name.toLowerCase().includes(query)
            const visible = matchesFilter && matchesSearch
            card.style.display = visible ? '' : 'none'
            if (visible) visibleProducts += 1
        })
    }

    filterButtons.forEach((button) => button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'))
        button.classList.add('active')
        selectedFilter = button.dataset.filter
        searchInput.placeholder = `Buscar en ${selectedFilter}`
        updateProducts()
    }))
    searchInput.addEventListener('input', updateProducts)
    document.querySelectorAll('.quick-add').forEach((button) => button.addEventListener('click', () => {
        cartItems += 1
        if (cartCount) cartCount.textContent = cartItems
        if (!toast) return
        toast.classList.add('show')
        window.setTimeout(() => toast.classList.remove('show'), 1800)
    }))
}

function initializeProductManagerSearch() {
    const searchInput = document.querySelector('#product-search')
    const productTableBody = document.querySelector('#product-table-body')
    const productCount = document.querySelector('#product-count')

    if (!searchInput || !productTableBody) return

    function filterProducts() {
        const query = searchInput.value.toLowerCase().trim()
        const rows = Array.from(productTableBody.querySelectorAll('tr'))
        let visibleProducts = 0

        rows.forEach((row) => {
            const matches = row.textContent.toLowerCase().includes(query)
            row.hidden = !matches
            if (matches) visibleProducts += 1
        })

        if (productCount) productCount.textContent = `${visibleProducts} de ${rows.length} productos`
    }

    searchInput.addEventListener('input', filterProducts)
    new MutationObserver(filterProducts).observe(productTableBody, { childList: true })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeMenu()
        initializeCart()
        initializeProductModal()
        initializeStore()
        initializeProductManagerSearch()
    })
} else {
    initializeMenu()
    initializeCart()
    initializeProductModal()
    initializeStore()
    initializeProductManagerSearch()
}
datosProductos()
const carrito = new Map()

function renderizarCarrito() {
    const carritoBody = document.querySelector('#carrito-table-body')
    const cartCount = document.querySelector('#cart-count')
    const cartTotal = document.querySelector('#cart-total')

    if (!carritoBody) return

    let totalUnidades = 0
    let totalCompra = 0
    let datos = ''

    carrito.forEach((item) => {
        totalUnidades += item.cantidad
        totalCompra += item.cantidad * item.precio
        const imagenProducto = item.imagen_ruta
            ? `<img class="product-thumb" src="/tienda/${item.imagen_ruta}" alt="${item.nombre}" loading="lazy" />`
            : '<span class="product-thumb no-image"></span>'

        datos += `<tr>
                    <td><div class="product-cell">${imagenProducto}<div><strong>${item.nombre}</strong><small>${item.descripcion}</small></div></div></td>
                    <td>$${formatearPrecio(item.precio)}
                    <div class="quantity-control" aria-label="Cantidad de ${item.nombre}">
                        <button type="button" class="quantity-btn" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Quitar una unidad">−</button>
                        <span>${item.cantidad}</span>
                        <button type="button" class="quantity-btn" data-cart-action="increase" data-product-id="${item.id}" aria-label="Agregar una unidad">+</button>
                    </div></td>
                </tr>`
    })

    carritoBody.innerHTML = datos
    if (cartCount) cartCount.textContent = totalUnidades
    if (cartTotal) cartTotal.textContent = `$${formatearPrecio(totalCompra)}`
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]')
    if (!button) return

    const id = String(button.dataset.productId)
    const item = carrito.get(id)
    if (!item) return

    if (button.dataset.cartAction === 'increase') item.cantidad += 1
    if (button.dataset.cartAction === 'decrease') {
        item.cantidad -= 1
        if (item.cantidad <= 0) carrito.delete(id)
    }
    renderizarCarrito()
    actualizarUrlCarrito()
})

function formatearPrecio(valor) {
    const numero = Number(valor) || 0
    return numero.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

const PRODUCTOS_POR_PAGINA = 12
let productosActuales = []

function renderizarPaginacion(totalProductos, paginaActual) {
    const paginacion = document.querySelector('#product-pagination')
    if (!paginacion) return

    const totalPaginas = Math.max(1, Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA))
    const pagina = Math.min(Math.max(1, Number(paginaActual) || 1), totalPaginas)

    let html = ''
    html += `<button type="button" class="pagination-btn" data-page="prev" ${pagina === 1 ? 'disabled' : ''} style="padding:8px 12px; border-radius:999px; border:1px solid #ddd; background:#fff; cursor:pointer;">Anterior</button>`

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button type="button" class="pagination-btn" data-page="${i}" ${i === pagina ? 'style="padding:8px 12px; border-radius:999px; border:1px solid #1f2937; background:#1f2937; color:#fff; cursor:pointer; width: 36px;"' : 'style="padding:8px 12px; border-radius:999px; border:1px solid #ddd; background:#fff; color:#1f2937; cursor:pointer; width: 36px;"'}>${i}</button>`
    }

    html += `<button type="button" class="pagination-btn" data-page="next" ${pagina === totalPaginas ? 'disabled' : ''} style="padding:8px 12px; border-radius:999px; border:1px solid #ddd; background:#fff; cursor:pointer;">Siguiente</button>`

    paginacion.innerHTML = html
    paginacion.querySelectorAll('.pagination-btn').forEach((boton) => {
        boton.addEventListener('click', function () {
            const accion = this.dataset.page
            let nuevaPagina = pagina

            if (accion === 'prev') nuevaPagina = pagina - 1
            if (accion === 'next') nuevaPagina = pagina + 1
            if (!isNaN(Number(accion))) nuevaPagina = Number(accion)

            const totalPaginasRender = Math.max(1, Math.ceil(productosActuales.length / PRODUCTOS_POR_PAGINA))
            nuevaPagina = Math.min(Math.max(1, nuevaPagina), totalPaginasRender)
            renderizarProductosDesdeLista(productosActuales, nuevaPagina)
        })
    })
}

function renderizarProductosDesdeLista(productos, paginaActual = 1) {
    const productGrid = document.querySelector('#product-grid')
    if (!productGrid) return

    productosActuales = Array.isArray(productos) ? productos : []
    const totalProductos = productosActuales.length
    const totalPaginas = Math.max(1, Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA))
    const pagina = Math.min(Math.max(1, Number(paginaActual) || 1), totalPaginas)
    const inicio = (pagina - 1) * PRODUCTOS_POR_PAGINA
    const fin = inicio + PRODUCTOS_POR_PAGINA

    const productosPagina = productosActuales.slice(inicio, fin)
    const datos = productosPagina.map(element => {
        const item = element
        const tags = item.tag ? `<span class="tag">${item.tag}</span>` : ''
        const imagen = item.imagen_ruta ? `<img src="/tienda/${item.imagen_ruta}" alt="${item.nombre}" loading="lazy" />`
            : '<div class="no-image">Sin imagen</div>'

        return `<article class="product-card" data-product-id="${item.id}" data-category="casa regalos" data-name="${item.nombre}">
                    <div class="product-photo">${imagen}
                    ${tags}<i class="bi bi-cart-plus quick-add icon" onclick="cargarCarrito('${item.id}')"></i></div>
                    <div class="product-info"><div><h3>${item.nombre}</h3><p>${item.descripcion}</p></div><span class="price">$${formatearPrecio(item.valor)}</span></div>
                </article>`
    }).join('')

    productGrid.innerHTML = datos
    renderizarPaginacion(totalProductos, pagina)
    abrirModalProductoDesdeUrl()
}

function datosProductos() {
    const datosPost = new FormData()
    datosPost.append('datosProductos', true)
    fetch('/tienda/ajax/datos_productos.php', {
        method: "POST",
        body: datosPost
    })
    .then(response => response.json())
    .then(function (json) {
        let datos = '',datos2 = '',categoria = ''
        if (json.error != '') return alertify.error(json.error)

        if (window.location.pathname.replace(/\/$/, '') === '/tienda/productos') {
            json.resp.forEach(element => {
                const imagenProducto = element.imagen_ruta
                    ? `<img class="product-thumb is-clickable" src="/tienda/${element.imagen_ruta}" alt="${element.nombre}" loading="lazy" />`
                    : '<span class="product-thumb no-image"></span>'
                    // 
                datos += `<tr data-product-id="${element.id}">
                            <td><div class="product-cell">${imagenProducto}<div><strong>${element.nombre}</strong>
                            <small>${element.descripcion}</small></div></div></td>
                            <td>$${formatearPrecio(element.valor)}</td>
                            <td><div class="action-icons">
                            <i class="bi bi-pencil-square icon" title="Editar" onclick="editarProducto('${element.id}')"></i>
                            <i class="bi bi-trash icon" title="Eliminar" onclick="eliminarProducto('${element.id}')"></i></div></td>
                        </tr>`
            })
            json.categorias.forEach(element2 => {
                datos2 += `<tr>
                            <td><strong>${element2.nombre}</strong></td>
                            <td><div class="action-icons">
                            <i class="bi bi-trash icon" title="Eliminar" onclick="eliminarProducto('${element2.id}', true)"></i></div></td>
                        </tr>`
            })
            categoria += `<option value="" selected disabled>Seleccione una categoría</option><option value="0">Ninguno</option>`
            json.categorias.forEach(element3 => {
                categoria += `<option value="${element3.id}">${element3.nombre}</option>`
            })
            document.querySelector('#product-table-body').innerHTML = datos
            document.querySelector('#categoria-table-body').innerHTML = datos2
            document.querySelector('#categoria').innerHTML = categoria
            document.querySelector('#product-count').textContent = json.resp.length + ' productos'
            abrirModalProductoDesdeUrl()
        }else {
            renderizarProductosDesdeLista(json.resp, 1)
        }
    }).catch(error => {
        alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
        console.error('Error:', error);
    })
}

categoriaProducto = 0
function buscarProductos(categoria = '') {
    let nombre = ''
    if (categoria == '') {
        nombre = document.querySelector('#search').value
    }else {
        categoriaProducto = categoria
        document.querySelector('#search').value = ''
    }
    const datosPost = new FormData()
    datosPost.append('buscarProductos', true)
    datosPost.append('categoria', categoriaProducto)
    datosPost.append('nombre', nombre)
    fetch('/tienda/ajax/datos_productos.php', {
        method: "POST",
        body: datosPost
    })
    .then(response => response.json())
    .then(function (json) {
        if (json.error != '') return alertify.error(json.error)
        renderizarProductosDesdeLista(json.resp, 1)
    }).catch(error => {
        alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
        console.error('Error:', error);
    })
}

function editarProducto(id = '') {
    document.querySelector('#nombre').value = ''
    document.querySelector('#descripcion').value = ''
    document.querySelector('#categoria').value = ''
    document.querySelector('#tag').value = ''
    document.querySelector('#precio').value = ''
    document.querySelector('#imagen').value = ''
    document.querySelector('#imagenes_cargadas').innerHTML = ''
    if (id == '') {
        document.querySelector('#title_ges').innerHTML = '<h2>Nuevo producto</h2>'  
        document.querySelector('#boton_carga_prod').textContent = 'Guardar producto'
        document.querySelector('#boton_carga_prod').setAttribute('onclick', `cargarProductos()`)
        return
    }
    const datosPost = new FormData()
    datosPost.append('editarProducto', true)
    datosPost.append('id', id)
    fetch('/tienda/ajax/datos_productos.php', {
        method: "POST",
        body: datosPost
    })
    .then(response => response.json())
    .then(function (json) {
        let datos = '',imagenes = ''
        if (json.error != '') return alertify.error(json.error)
        document.querySelector('#title_ges').innerHTML = '<h2>Editar producto</h2><button class="icon" type="button" aria-label="Cerrar detalle del producto" onclick="editarProducto()">×</button>'
        document.querySelector('#boton_carga_prod').textContent = 'Editar producto'
        document.querySelector('#boton_carga_prod').setAttribute('onclick', `cargarProductos('${id}')`)
        json.resp.forEach(element => {
            document.querySelector('#nombre').value = element.nombre
            document.querySelector('#descripcion').value = element.descripcion
            document.querySelector('#categoria').value = element.categoria
            document.querySelector('#tag').value = element.tag
            document.querySelector('#precio').value = element.valor
        })
        json.imagenes.forEach(element => {
            imagenes += `<div class="loaded-image-item">
                                <img class="loaded-image-thumb" src="/tienda/${element.imagen_ruta}" alt="${element.imagen_nombre}" loading="lazy" />
                                <span title="${element.imagen_nombre}">${element.imagen_nombre}</span>
                                <button class="loaded-image-remove" type="button" aria-label="Quitar ${element.imagen_nombre}" onclick="eliminarProducto(${element.id},'img',this)">×</button>
                            </div>`
        })
        document.querySelector('#imagenes_cargadas').innerHTML = imagenes
        document.querySelector('#boton_carga_prod').focus()
    }).catch(error => {
        alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
        console.error('Error:', error);
    })
}

function cargarProductos(id = '') {
    const formulario = document.querySelector('#producto-form')
    const imagenInput = document.querySelector('#imagen')
    const nombre = document.querySelector('#nombre').value
    const descripcion = document.querySelector('#descripcion').value
    const categoria = document.querySelector('#categoria').value
    const tag = document.querySelector('#tag').value
    const precio = document.querySelector('#precio').value

    if (!formulario.checkValidity()) {
        formulario.reportValidity()
        return
    }

    const datosPost = new FormData()
    if (id != '') {
        datosPost.append('editarProductos', true)
        datosPost.append('id', id)
    }else {
        datosPost.append('cargarProductos', true)
    }
    datosPost.append('nombre', nombre)
    datosPost.append('descripcion', descripcion)
    datosPost.append('categoria', categoria)
    datosPost.append('tag', tag)
    datosPost.append('precio', precio)
    Array.from(imagenInput.files).forEach((imagen) => {
        datosPost.append('imagenes[]', imagen)
    })
    alertify.confirm('Nuevo producto', '\u00BFSeguro quiere cargar este producto?', function(){
        fetch('/tienda/ajax/cargar_productos.php', {
            method: "POST",
            body: datosPost
        })
        .then(response => response.json())
        .then(function (json) {
            if (json.error != '') return alertify.error(json.error)
            editarProducto()
            datosProductos()
            return alertify.success(json.resp)
        }).catch(error => {
            alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
            console.error('Error:', error);
        })
    }, function(){ 
        alertify.error('Cancelado')
    })
}

function cargarCategoria() {
    const formulario = document.querySelector('#categoria-form')
    const nombre = document.querySelector('#nombre_categoria').value

    if (!formulario.checkValidity()) {
        formulario.reportValidity()
        return
    }
    const datosPost = new FormData()
    datosPost.append('cargarCategoria', true)
    datosPost.append('nombre', nombre)
    alertify.confirm('Nueva categoría', '\u00BFSeguro quiere cargar esta categoría?', function(){
        fetch('/tienda/ajax/cargar_productos.php', {
            method: "POST",
            body: datosPost
        })
        .then(response => response.json())
        .then(function (json) {
            if (json.error != '') return alertify.error(json.error)
            document.querySelector('#nombre_categoria').value = ''
            datosProductos()
            return alertify.success(json.resp)
        }).catch(error => {
            alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
            console.error('Error:', error);
        })
    }, function(){ 
        alertify.error('Cancelado')
    })
}

function eliminarProducto(id, categoria = false, element = false) {
    const datosPost = new FormData()
    if (categoria == 'img') {
        datosPost.append('eliminarImagen', true)
    }else if (categoria) {
        datosPost.append('eliminarCategoria', true)
    }else {
        datosPost.append('eliminarProducto', true)
    }
    datosPost.append('id', id)
    let mensaje = categoria ? '¿Seguro quiere eliminar esta categoría?' : '¿Seguro quiere eliminar este producto?',
    titulo = categoria ? 'Eliminar categoría' : 'Eliminar producto'
    mensaje = categoria == 'img' ? '¿Seguro quiere eliminar esta imagen?' : mensaje
    titulo = categoria == 'img' ? 'Eliminar imagen' : titulo
    alertify.confirm(titulo, mensaje, function(){
        fetch('/tienda/ajax/eliminar_producto.php', {
            method: "POST",
            body: datosPost
        })
        .then(response => response.json())
        .then(function (json) {
            if (json.error != '') return alertify.error(json.error)
            if (element) element.closest('.loaded-image-item').remove()
            datosProductos()
            return alertify.success(json.resp)
        }).catch(error => {
            alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
            console.error('Error:', error);
        })
    }, function(){ 
        alertify.error('Cancelado')
    })
}

function cargarCarrito(id) {
    const datosPost = new FormData()
    datosPost.append('cargarCarrito', true)
    datosPost.append('id', id)
    fetch('/tienda/ajax/cargar_carrito.php', {
        method: "POST",
        body: datosPost
    })
    .then(response => response.json())
    .then(function (json) {
        if (json.error != '') return alertify.error(json.error)
        json.resp.forEach((element) => {
            const productoId = String(element.id)
            const item = carrito.get(productoId)
            if (item) {
                item.cantidad += 1
                return
            }

            carrito.set(productoId, {
                ...element,
                precio: Number(element.valor) || 0,
                cantidad: 1
            })
        })
        renderizarCarrito()
        actualizarUrlCarrito()
        alertify.success('Producto agregado al carrito')
    }).catch(error => {
        alertify.error('Ocurrio un error inesperado, vuelva a intentar por favor.')
        console.error('Error:', error);
    })
}

function obtenerProductoParaCarrito(id) {
    const datosPost = new FormData()
    datosPost.append('cargarCarrito', true)
    datosPost.append('id', id)

    return fetch('/tienda/ajax/cargar_carrito.php', { method: 'POST', body: datosPost })
        .then(response => response.json())
        .then(json => {
            if (json.error || !Array.isArray(json.resp)) return []
            return json.resp
        })
}

function actualizarUrlCarrito() {
    const url = new URL(window.location.href)
    const ids = []

    carrito.forEach((item, id) => {
        for (let cantidad = 0; cantidad < item.cantidad; cantidad += 1) ids.push(id)
    })

    if (ids.length) url.searchParams.set('carrito', ids.join(','))
    else url.searchParams.delete('carrito')
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
}

function compartirCarrito() {
    if (!carrito.size) {
        alertify.error('Agregá al menos un producto para compartir el carrito')
        return
    }

    actualizarUrlCarrito()
    const enlace = window.location.href
    const datos = { title: 'Mi carrito de Nido', text: 'Mirá los productos que elegí:', url: enlace }

    if (navigator.share) {
        navigator.share(datos).catch(() => {})
        return
    }

    if (!navigator.clipboard) {
        alertify.error(`Compartí este enlace: ${enlace}`)
        return
    }

    navigator.clipboard.writeText(enlace)
        .then(() => alertify.success('Enlace del carrito copiado'))
        .catch(() => alertify.error(`Compartí este enlace: ${enlace}`))
}

function compartirProducto(id, nombre, precio) {
    if (!id) return

    const urlProducto = new URL(window.location.href)
    urlProducto.searchParams.delete('carrito')
    urlProducto.searchParams.set('id', String(id))
    const enlace = urlProducto.toString()
    const datos = {
        title: nombre,
        text: `Mirá este producto: ${nombre} - ${precio}`,
        url: enlace
    }

    if (navigator.share) {
        navigator.share(datos).catch(() => {})
        return
    }

    if (!navigator.clipboard) {
        alertify.error(`Compartí este enlace: ${enlace}`)
        return
    }

    navigator.clipboard.writeText(enlace)
        .then(() => alertify.success('Enlace del producto copiado'))
        .catch(() => alertify.error(`Compartí este enlace: ${enlace}`))
}

function cargarCarritoDesdeUrl() {
    const parametro = new URLSearchParams(window.location.search).get('carrito')
    if (!parametro) return

    const ids = parametro.split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id))
    if (!ids.length) return

    Promise.all(ids.map(id => obtenerProductoParaCarrito(id)))
        .then(productos => {
            productos.flat().forEach((element) => {
                const productoId = String(element.id)
                const item = carrito.get(productoId)
                if (item) {
                    item.cantidad += 1
                    return
                }

                carrito.set(productoId, {
                    ...element,
                    precio: Number(element.valor) || 0,
                    cantidad: 1
                })
            })
            renderizarCarrito()
            if (window.abrirCarrito) window.abrirCarrito()
        })
        .catch(error => console.error('Error al cargar el carrito compartido:', error))
}

function abrirModalProductoDesdeUrl() {
    const id = new URLSearchParams(window.location.search).get('id')
    if (id && window.abrirModalProductoPorId) window.abrirModalProductoPorId(id)
}