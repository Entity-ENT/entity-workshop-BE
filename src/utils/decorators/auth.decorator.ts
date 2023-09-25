import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PUBLIC_OR_AUTHENTICATED_KEY = 'isPublicOrAuthenticated';
/**
 * @summary Represents extended behaviour and capabilities comparing with the homologous [@Public]{@link Public}
 * endpoints decorator.
 *
 * For more complex scenarios where 2 endpoints do basically the same thing, but the implementation differs very little
 * in terms of the authenticated state, this decorator authenticates the user if the auth token is attached to the
 * Authorization request header, otherwise the behaviour is like the [@Public]{@link Public} decorator. Hence, depending
 * on the case, the injected
 * <pre><code>
 *     @User() authUser?: Users
 * </code></pre>
 * will be defined or not and the implementation can be optimised accordingly.
 */
export const PublicOrAuthenticated = (): CustomDecorator => SetMetadata(IS_PUBLIC_OR_AUTHENTICATED_KEY, true);
