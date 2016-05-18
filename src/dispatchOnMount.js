import React, { Component, PropTypes } from 'react';
import { Subscription } from 'rxjs/Subscription';

const $$reduxObservableSubscription = '@@reduxObservableSubscription';

export function dispatchOnMount(...factories) {
  return (ComposedComponent) =>
    class DispatchOnMountComponent extends Component {
      static contextTypes = {
        store: PropTypes.object.isRequired
      }

      componentDidMount() {
        this[$$reduxObservableSubscription] = new Subscription();
        factories.map(factory => this.context.store.dispatch(factory(this.props)))
          .forEach(sub => sub && this[$$reduxObservableSubscription].add(sub));
      }

      componentWillUnmount() {
        this[$$reduxObservableSubscription].unsubscribe();
      }

      render() {
        return (<ComposedComponent {...this.props} />);
      }
    };
}
