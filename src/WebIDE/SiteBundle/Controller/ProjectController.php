<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\ProjectVersion;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use WebIDE\SiteBundle\Entity\File;
use WebIDE\SiteBundle\Entity\Project;
use WebIDE\SiteBundle\Entity\OwnableEntity;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ProjectController extends Controller
{
    public function getProjectsAction()
    {
        $projects = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProjectsByUser($this->get('security.context')->getToken()->getUser());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     * @Rest\Route("/projects/recent")
     */
    public function getRecentProjectsAction()
    {
        $this->checkPermission();

        $projects = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProjectsByUser($this->get('security.context')->getToken()->getUser(), 5);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getProjectAction($id)
    {
        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($id);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($id, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        // Set the current version of the project and its read only status (Not stored in db)
        $project->setCurrentVersion($version->getVersionNumber());
        $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Get("/projects/{id}/{version}", requirements={"version" = "\d+", "id" = "\d+"})
     */
    public function getProjectVersionAction($id, $version)
    {
        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersion($id, $version);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProjectByVersion($id, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        // Set the current version of the project and its read only status (Not stored in db)
        $project->setCurrentVersion($version->getVersionNumber());
        $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Get("/projects/{id}/version")
     */
    public function newProjectVersionAction($id)
    {
        $this->checkPermission();

        $em = $this->getDoctrine()->getManager();

        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($id);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($id, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        $this->checkPermission($project);

        // Create the new version
        $newVersion = new ProjectVersion();
        $newVersion->setVersionNumber($version->getVersionNumber());
        $newVersion->incVersionNumber();
        $newVersion->setProject($project);

        // Clone each file and set its version to the new version
        $newFiles = array();
        foreach($project->getFiles() as $file) {
            // If the file is not of the same version as the current version skip file
            if($file->getVersion() && $file->getVersion()->getId() !== $version->getId()) {
                continue;
            }

            $newFile = $this->bindFileData(new File(), $project, $newVersion, $file->toArray());

            $newFiles[] = $newFile;
        }

        $project->setFiles($newFiles);

        // Set the current version of the project and its read only status (Not stored in db)
        $project->setCurrentVersion($newVersion->getVersionNumber());
        $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());

        $this->checkPermission($project);

        $em->persist($newVersion);
        $em->persist($project);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function postProjectsAction()
    {
        $this->checkPermission();

        $em = $this->getDoctrine()->getManager();

        $version = new ProjectVersion();
        $project = new Project();
        $project->setUser($this->get('security.context')->getToken()->getUser());
        $project = $this->createProjectFromRequest($project, $version);

        $version->setProject($project);

        $validator = $this->get('validator');
        $errors = $validator->validate($project);

        if (count($errors) > 0) {
            throw new HttpException(400, "Invalid Request");
        }

        $project->setCurrentVersion($version->getVersionNumber());
        $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());

        $em->persist($version);
        $em->persist($project);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putProjectAction($id)
    {
        $this->checkPermission();

        $em = $this->getDoctrine()->getManager();

        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($id);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($id, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        } catch (\Doctrine\Orm\NoResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        $this->checkPermission($project);

        $project = $this->createProjectFromRequest($project, $version);

        $validator = $this->get('validator');
        $errors = $validator->validate($project);

        if (count($errors) > 0) {
            throw new HttpException(400, "Invalid Request");
        }

        $em->persist($version);
        $em->persist($project);
        $em->flush();

        $project->setCurrentVersion($version->getVersionNumber());
        $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());

        $this->checkPermission($project);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteProjectAction($id)
    {
        $this->checkPermission();

        try {
            $version = $this->getDoctrine()->getRepository('WebIDESiteBundle:ProjectVersion')->findVersionByProject($id);
            $project = $this->getDoctrine()->getRepository('WebIDESiteBundle:Project')->findProject($id, $version);
            $project->setReadOnly($this->get('security.context')->getToken()->getUser() !== $project->getUser());
        } catch (\Doctrine\Orm\NonUniqueResultException $e) {
            throw $this->createNotFoundException('Project not found.');
        }

        $this->checkPermission($project);

        // Delete project
        $em = $this->getDoctrine()->getManager();
        $em->persist($project);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    protected function createProjectFromRequest(Project $project, $version)
    {
        $request = $this->getRequest();
        $files = array();
        $hash = hash_init("md5");

        foreach ($request->get('files', array()) as $fileData) {
            $file = new File();

            // If a new version is requested create a new file
            if(isset($fileData['id']) && $version->getId()) {
                $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->find(array('id' => $fileData['id']));
                // If the file is not of the same version as the current version skip file
                if($file->getVersion() && $file->getVersion()->getId() !== $version->getId()) {
                    continue;
                }
            }

            $file = $this->bindFileData($file, $project, $version, $fileData);
            $files[] = $file;

            //Update hash
            hash_update($hash, $file->getContent());
        }

        $project->setName($request->get('name', ''));
        $project->setDescription($request->get('description', ''));
        $project->setHash(hash_final($hash));
        $project->setFiles($files);

        return $project;
    }

    protected function checkPermission(OwnableEntity $entity=null)
    {
        if($entity !== null) {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }
            if($this->get('security.context')->getToken()->getUser() !== $entity->getUser()) {
                throw new HttpException(403, "Unauthorized");
            }

            return true;
        } else {
            if(!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new HttpException(401, "Unauthorized");
            }

            return true;
        }
    }

    protected function bindFileData(File $file, Project $project, ProjectVersion $version, array $data)
    {
        $file->setActive(array_key_exists('active', $data) ? !!$data['active'] : false);
        $file->setSelected(array_key_exists('selected', $data) ? !!$data['selected'] : false);
        $file->setResource(array_key_exists('resource', $data) ? $data['resource'] : "");
        $file->setOrder(array_key_exists('order', $data) ? $data['order'] : 1);
        $file->setType(array_key_exists('type', $data) ? $data['type'] : "html");
        $file->setName(array_key_exists('name', $data) ? $data['name'] : "");
        $file->setContent(array_key_exists('content', $data) ? $data['content'] : "");
        $file->setVersion($version);
        $file->setProject($project);
        $file->setUser($this->get('security.context')->getToken()->getUser());

        return $file;
    }
}