package datos;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

public class Conexion
{
    private static final String URI = System.getenv("MONGODB_URI");
    private static final String DB_NAME = System.getenv("MONGODB_DB");

    private static MongoClient mongoClient;

    public static MongoClient getClient()
    {
        if(mongoClient == null)
            mongoClient = MongoClients.create(URI);

        return mongoClient;
    }

    public static MongoDatabase getDatabase()
    {
        return getClient().getDatabase(DB_NAME);
    }

    public static void close()
    {
        if(mongoClient != null)
        {
            mongoClient.close();
            mongoClient = null;
        }
    }
}