package A_basic.datastore;

        import A_basic.model.Customer;
import A_basic.model.Restaurant;
import A_basic.model.MenuItem;
import A_basic.model.DeliveryPartner;
import A_basic.model.Order;
import java.util.List;

        public interface DataStore {

            Customer getCustomer(String key);

            void putCustomer(String key, Customer value);

            boolean containsCustomer(String key);

            Customer removeCustomer(String key);
            Restaurant getRestaurant(String key);

            void putRestaurant(String key, Restaurant value);

            boolean containsRestaurant(String key);

            Restaurant removeRestaurant(String key);
            MenuItem getMenuItem(String key);

            void putMenuItem(String key, MenuItem value);

            boolean containsMenuItem(String key);

            MenuItem removeMenuItem(String key);
            DeliveryPartner getDeliveryPartner(String key);

            void putDeliveryPartner(String key, DeliveryPartner value);

            boolean containsDeliveryPartner(String key);

            DeliveryPartner removeDeliveryPartner(String key);

            List<DeliveryPartner> getDeliveryPartnerList();
            Order getOrder(String key);

            void putOrder(String key, Order value);

            boolean containsOrder(String key);

            Order removeOrder(String key);
        }
