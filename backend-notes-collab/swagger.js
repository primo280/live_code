// swagger.js
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Notes Collaboratives',
      version: '1.0.0',
      description: 'Documentation de l\'API pour la gestion de notes collaboratives avec notifications en temps réel.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Serveur local',
      },
    ],
    tags: [
      { name: 'Notes', description: 'Gestion des notes' },
      { name: 'Notifications', description: 'Affichage des notifications de modifications' },
    ],
    components: {
      schemas: {
        Note: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            message: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/notes': {
        get: {
          tags: ['Notes'],
          summary: 'Liste toutes les notes',
          responses: {
            200: {
              description: 'Succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Note' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Notes'],
          summary: 'Créer une nouvelle note',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' },
              },
            },
          },
          responses: {
            201: {
              description: 'Note créée',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
          },
        },
      },
      '/notes/{id}': {
        get: {
          tags: ['Notes'],
          summary: 'Récupère une note par son ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Note trouvée',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            404: {
              description: 'Note non trouvée',
            },
          },
        },
        put: {
          tags: ['Notes'],
          summary: 'Met à jour une note',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Note' },
              },
            },
          },
          responses: {
            200: {
              description: 'Note mise à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Note' },
                },
              },
            },
            404: {
              description: 'Note non trouvée',
            },
          },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Récupère la dernière notification',
          responses: {
            200: {
              description: 'Notification retournée',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Notification' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };