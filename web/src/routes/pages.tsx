import { createRoute } from '@tanstack/react-router'
import { HomePage } from '../features/home/home-page'
import { ItemPage } from '../features/items/item-page'
import { rootRoute } from './root'

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const itemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items/$id',
  component: function ItemRoute() {
    const { id } = itemRoute.useParams()
    return <ItemPage key={id} id={id} />
  },
})

export const routeTree = rootRoute.addChildren([homeRoute, itemRoute])
